import { DataSource, DataSourceOptions, EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { fetchTokensData, getUniqueTokens } from './helpers/getTokensData';
import { Tokens } from './helpers/entities/entities/Tokens';
import { Pools } from './helpers/entities/entities/Pools';
import { CreateTokenDto } from './helpers/dtos/token-dto/token.dto';
import { TokensService } from './helpers/tokens/tokens.service';
import { PoolsService } from './helpers/pools/pools.service';
import { getUniswapV3PoolsFromFactory } from './helpers/getUniswapV3PoolsFromFactory';
import { getCamelotV3PoolsFromFactory } from './helpers/getCamelotV3PoolsFromFactory';
import { getV2PoolsFromFactory } from './helpers/getV2PoolsFromFactory';
import { GetV3ReservesHelper } from './helpers/getV3Reserves';
import { GetV2ReservesHelper } from './helpers/getV2Reserves';
import { UpdateReservesDto } from './helpers/dtos/pools-dto/pool.dto';
import { Chains } from './helpers/entities/entities/Chains';
import { Dexes } from './helpers/entities/entities/Dexes';
import { DBConnector } from './dbConnector';
import { ChainsService } from './helpers/chains/chains.service';
import { DexesService } from './helpers/dexes/dexes.service';
import { IConfig, IConfigDB, IPool, IV2ReserveResponse } from './models';

const logger = new Logger('BlockchainLogic');

export async function getPoolsFromFactory(deps: {
  jobType: string;
  rpcUrl: string;
  pairsToQuote: any;
  extraSettings?: string;
}) {
  const { extraSettings } = deps;

  let parsedSettings: any;
  try {
    parsedSettings = typeof extraSettings === 'string'
      ? JSON.parse(extraSettings)
      : extraSettings;
  } catch (e) {
    console.error('!!! Invalid extraSettings JSON', e.message);
    return { success: false, error: 'Invalid extraSettings JSON' };
  }

  const configData = parsedSettings.configData;
  const configDB: IConfigDB = parsedSettings.configDB;

  if (!configDB) {
    console.error('!!! No configDB provided');
    return { success: false, error: 'No configDB provided' };
  }

  if (!configData) {
    console.error('!!! No configData provided');
    return { success: false, error: 'No configData provided' };
  }

  console.log('--- [START] getPoolsFromFactory ---');

  let dataSource: DataSource | undefined;

  try {
    dataSource = await DBConnector.create(configDB as DataSourceOptions);
    const manager = dataSource.manager;
    const tokensService = new TokensService(
      manager.getRepository(Tokens),
      manager.getRepository(Chains),
    );

    const chainsService = new ChainsService(manager.getRepository(Chains));
    const dexesService = new DexesService(manager.getRepository(Dexes));

    const poolsService = new PoolsService(
      manager.getRepository(Pools),
      tokensService,
      chainsService,
      dexesService,
    );

    let pools: any[] = [];
    if (configData.dexName === 'camelot' && configData.version === 'v3') {
      pools = await getCamelotV3PoolsFromFactory(
        configData.factoryAddress,
        configData.start,
        configData.finish,
      );
    } else if ((configData.dexName === 'uniswap' || configData.dexName === 'sushiswap') && configData.version === 'v3') {
      pools = await getUniswapV3PoolsFromFactory(
        configData.factoryAddress,
        configData.start,
        configData.finish,
      );
    } else if (configData.version === 'v2') {
      pools = await getV2PoolsFromFactory(
        configData.factoryAddress,
        configData.start,
        configData.finish,
      );
    }

    if (!pools || pools.length === 0)
      return { success: true, message: 'No pools found' };

    const uniqueTokens = getUniqueTokens(pools);

    const newTokenAddresses = await filterNewTokenAddresses(
      uniqueTokens,
      tokensService,
      manager,
    );
    console.log('[newTokenAddresses] ::: ', newTokenAddresses);
    const tokensData = await fetchTokensData(newTokenAddresses);
    const tokensToSave = tokensData.map((t) => ({ ...t, chainId: 42161 }));

    await saveTokensIfNotExist(tokensToSave, tokensService, manager);
    const tokenMap = await buildTokenMap(tokensService, manager);
    const existingPools = await getExistingPoolsSet(poolsService, manager);

    const createdPools = await createPools(
      pools,
      tokenMap,
      existingPools,
      configData,
      poolsService,
      manager,
    );

    const v2Helper = new GetV2ReservesHelper();
    const v3Helper = new GetV3ReservesHelper();
    console.log('[setReserves] ::: ', setReserves);
    await setReserves(
      poolsService,
      v2Helper,
      v3Helper,
      configData,
      manager,
    );

    return createdPools;
  } catch (error) {
    console.error(
      '!!! ERROR IN getPoolsFromFactory:',
      error.message,
    );
    console.error(error.stack);
    throw error;
  } finally {
    if (dataSource) {
      await DBConnector.close(dataSource);
      console.debug('--- [FINALLY] Connection closed via DBConnector. ---');
    }
  }
}

export async function filterNewTokenAddresses(
  tokenAddresses: string[],
  tokensService: TokensService,
  manager: EntityManager,
): Promise<string[]> {
  const existingTokens = await tokensService.findAll(manager);
  const existingAddresses = new Set(
    existingTokens.map((t) => t.address.toLowerCase()),
  );

  const result: string[] = [];

  for (const addr of tokenAddresses) {
    const normalized = addr.toLowerCase();

    if (!existingAddresses.has(normalized)) {
      result.push(normalized);
    }
  }

  return result;
}

export async function saveTokensIfNotExist(
  tokensData: Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: number;
  }>,
  tokensService: TokensService,
  manager: EntityManager,
) {
  const savedTokens: Tokens[] = [];

  const cleanString = (
    str: string | null | undefined,
    maxLength = 255,
  ): string => {
    if (!str) return '';

    return str.replace(/\0/g, '').trim().slice(0, maxLength);
  };

  for (const token of tokensData) {
    const dto: CreateTokenDto = {
      address: token.address.toLowerCase(),
      symbol: cleanString(token.symbol, 50),
      tokenName: cleanString(token.name, 255),
      decimals: token.decimals,
      chainId: token.chainId,
    };

    const savedToken = await tokensService.create(dto, manager);
    savedTokens.push(savedToken);
  }

  return savedTokens;
}

export async function buildTokenMap(
  tokensService: TokensService,
  manager: EntityManager,
): Promise<Map<string, number>> {
  const tokens = await tokensService.findAll(manager);

  return new Map(tokens.map((t) => [t.address.toLowerCase(), t.tokenId]));
}

export async function getExistingPoolsSet(
  poolsService: PoolsService,
  manager: EntityManager,
): Promise<Set<string>> {
  const existingPools = await poolsService.findAll(manager);
  return new Set(
    existingPools
      .map((p) => p.poolAddress)
      .filter((addr): addr is string => !!addr)
      .map((addr) => addr.toLowerCase()),
  );
}
export async function createPools(
  pools: IPool[],
  tokenMap: Map<string, number>,
  existingPools: Set<string>,
  config: IConfig,
  poolsService: PoolsService,
  manager: EntityManager,
) {
  const createdPools: Pools[] = [];

  for (const pool of pools) {
    const poolAddress = (
      config.version === 'v2' ? pool.pair : pool.pool
    )?.toLowerCase();
    const t0Addr = pool.token0?.toLowerCase();
    const t1Addr = pool.token1?.toLowerCase();

    if (!poolAddress || !t0Addr || !t1Addr) {
      logger.warn(
        `Skipped pool: missing address or tokens ${JSON.stringify(pool)}`,
      );
      continue;
    }

    const token0Id = tokenMap.get(t0Addr);
    const token1Id = tokenMap.get(t1Addr);

    if (existingPools.has(poolAddress) || !token0Id || !token1Id) {
      if (!token0Id || !token1Id)
        logger.warn(`Tokens not found for pool ${poolAddress}`);
      continue;
    }

    try {
      const savedPool = await poolsService.create(
        {
          token0: token0Id,
          token1: token1Id,
          poolAddress,
          fee: pool.fee ?? config.fee,
          version: config.version ?? 'v4',
          dexId: config.dexId,
          chainId: config.chainId,
        },
        manager,
      );

      createdPools.push(savedPool);
    } catch (e) {
      logger.error(`Failed to save pool ${poolAddress}: ${e.message}`);
    }
  }
  return createdPools;
}

export async function setReserves(
  poolsService: PoolsService,
  getV2ReservesHelper: GetV2ReservesHelper,
  getV3ReservesHelper: GetV3ReservesHelper,
  configData: IConfig,
  manager: EntityManager,
) {
  const allPools = await poolsService.findAll(manager);

  const filteredPools = allPools.filter(
    (p) =>
      p.version === configData.version &&
      (p.reserve0 === null || p.reserve1 === null),
  );

  const fetcher =
    configData.version === 'v2'
      ? (addr: string) =>
        getV2ReservesHelper.getV2Reserves(addr as `0x${string}`)
      : (addr: string) =>
        getV3ReservesHelper.getV3Reserves(addr as `0x${string}`);

  const reserves: UpdateReservesDto[] = [];

  for (const pool of filteredPools) {
    try {
      if (!pool.poolAddress) continue;

      const reserve = (await fetcher(
        pool.poolAddress,
      )) as IV2ReserveResponse | null;

      if (!reserve) continue;

      reserves.push({
        address: reserve.address,
        token0: reserve.token0 ?? '',
        token1: reserve.token1 ?? '',
        reserve0: reserve.reserve0?.toString() ?? '0',
        reserve1: reserve.reserve1?.toString() ?? '0',
      });
    } catch (error) {
      console.error(
        `Error getting reserves for pool ${pool.poolAddress}:`,
        error,
      );
    }
  }

  await poolsService.updateReserves(reserves, manager);
}
