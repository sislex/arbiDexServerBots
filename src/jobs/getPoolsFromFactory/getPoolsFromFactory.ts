import { fetchTokensData, getUniqueTokens } from './helpers/getTokensData';
import { Tokens } from './helpers/entities/entities/Tokens';
import { Pools } from './helpers/entities/entities/Pools';
import { PoolDto, UpdateReservesDto } from './helpers/dtos/pools-dto/pool.dto';
import { CreateTokenDto } from './helpers/dtos/token-dto/token.dto';
import { TokensService } from './helpers/tokens/tokens.service';
import { PoolsService } from './helpers/pools/pools.service';
import { Logger } from '@nestjs/common';

import { getUniswapV3PoolsFromFactory } from './helpers/getUniswapV3PoolsFromFactory';
import { getCamelotV3PoolsFromFactory } from './helpers/getCamelotV3PoolsFromFactory';
import { getV2PoolsFromFactory } from './helpers/getV2PoolsFromFactory';

// functions get Reserves
import { GetV3ReservesHelper } from './helpers/getV3Reserves';
import { GetV2ReservesHelper } from './helpers/getV2Reserves';

import { configCreateCamelotV2 } from './config';

export interface IPool {
  pool?: string;
  pair?: string;
  token0: string;
  token1: string;
  fee?: number;
}

export interface IConfig {
  factoryAddress: string;
  version: 'v2' | 'v3' | 'v4';
  dexId: number;
  fee: number;
  start: number;
  finish: number | undefined;
  dexName: string;
}
interface IV2ReserveResponse {
  address: string;
  token0: string;
  token1: string;
  reserve0: bigint | number | string;
  reserve1: bigint | number | string;
}

const logger = new Logger('BlockchainLogic');

export async function getPoolsFromFactory(deps: {
  tokensService: TokensService;
  poolsService: PoolsService;
  getV2ReservesHelper: GetV2ReservesHelper;
  getV3ReservesHelper: GetV3ReservesHelper;
  configData: IConfig;
}) {
  console.debug('getPoolsFromFactory');
  const { tokensService, poolsService, getV2ReservesHelper, getV3ReservesHelper, configData = configCreateCamelotV2} = deps;

  let pools: any;
  if (configData.dexName === 'camelot' && configData.version === 'v3') {
    pools = await getCamelotV3PoolsFromFactory(configData.factoryAddress, configData.start, configData.finish);
  } else if (configData.dexName === 'sushiswap' && configData.version === 'v3') {
    pools = await getUniswapV3PoolsFromFactory(configData.factoryAddress, configData.start, configData.finish);
  } else if (configData.dexName === 'uniswap' && configData.version === 'v3') {
    pools = await getUniswapV3PoolsFromFactory(configData.factoryAddress, configData.start, configData.finish);
  } else if (configData.version === 'v2') {
    pools = await getV2PoolsFromFactory(
      configData.factoryAddress,
      configData.start,
      configData.finish
    );
  }


  const uniqueTokens = getUniqueTokens(pools);
  console.log('uniqueTokens::::', uniqueTokens);

  const newTokenAddresses = await filterNewTokenAddresses(
    uniqueTokens,
    tokensService,
  );
  console.log('newTokenAddresses::::', newTokenAddresses);

  const tokensData = await fetchTokensData(newTokenAddresses);
  console.log('tokensData::::', tokensData);

  const tokensToSave = tokensData.map((t) => ({ ...t, chainId: 42161 }));

  await saveTokensIfNotExist(tokensToSave, tokensService);

  const tokenMap = await buildTokenMap(tokensService);

  const existingPools = await getExistingPoolsSet(poolsService);

  await createPools(pools, tokenMap, existingPools, configData, poolsService);

  await setReserves(poolsService, getV2ReservesHelper, getV3ReservesHelper, configData);


  return await createPools(
    pools,
    tokenMap,
    existingPools,
    configData,
    poolsService,
  ); //добавленная логика
}

export async function filterNewTokenAddresses(
  tokenAddresses: string[],
  tokensService: TokensService,
): Promise<string[]> {
  console.log('existingTokens::::');

  const existingTokens = await tokensService.findAll();
  console.log('existingTokens::::', existingTokens);
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

    const savedToken = await tokensService.create(dto);
    savedTokens.push(savedToken);
  }

  return savedTokens;
}

export async function buildTokenMap(
  tokensService: TokensService,
): Promise<Map<string, number>> {
  const tokens = await tokensService.findAll();

  return new Map(tokens.map((t) => [t.address.toLowerCase(), t.tokenId]));
}

export async function getExistingPoolsSet(
  poolsService: PoolsService,
): Promise<Set<string>> {
  const existingPools = await poolsService.findAll();
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
) {
  const createdPools: Pools[] = [];

  for (const pool of pools) {
    // 1. Компактное получение адреса и токенов
    const poolAddress = (config.version === 'v2' ? pool.pair : pool.pool)?.toLowerCase();
    const t0Addr = pool.token0?.toLowerCase();
    const t1Addr = pool.token1?.toLowerCase();

    // 2. Единая проверка на существование всех необходимых данных
    if (!poolAddress || !t0Addr || !t1Addr) {
      logger.warn(`Skipped pool: missing address or tokens ${JSON.stringify(pool)}`);
      continue;
    }

    // 3. Быстрая проверка на дубликаты и наличие токенов в мапе
    const token0Id = tokenMap.get(t0Addr);
    const token1Id = tokenMap.get(t1Addr);

    if (existingPools.has(poolAddress) || !token0Id || !token1Id) {
      if (!token0Id || !token1Id) logger.warn(`Tokens not found for pool ${poolAddress}`);
      continue;
    }

    try {
      // 4. Прямая передача объекта в сервис без создания лишних переменных
      const savedPool = await poolsService.create({
        token0: token0Id,
        token1: token1Id,
        poolAddress,
        fee: pool.fee ?? config.fee,
        version: config.version ?? 'v4',
        dexId: config.dexId,
        chainId: 42161,
      });
      createdPools.push(savedPool);
    } catch (e) {
      logger.error(`Error creating pool ${poolAddress}: ${e instanceof Error ? e.message : e}`);
    }
  }

  return createdPools;
}


export async function setReserves(
  poolsService: PoolsService,
  getV2ReservesHelper: GetV2ReservesHelper,
  getV3ReservesHelper: GetV3ReservesHelper,
  configData: IConfig,
) {
  const allPools = await poolsService.findAll();

  const filteredPools = allPools.filter(p =>
    p.version === configData.version && (p.reserve0 === null || p.reserve1 === null)
  );

  const fetcher = configData.version === 'v2'
    ? (addr: string) => getV2ReservesHelper.getV2Reserves(addr as `0x${string}`)
    : (addr: string) => getV3ReservesHelper.getV3Reserves(addr as `0x${string}`);

  const reserves: UpdateReservesDto[] = [];

  for (const pool of filteredPools) {
    try {
      if (!pool.poolAddress) continue;

      const reserve = await fetcher(pool.poolAddress) as IV2ReserveResponse | null;

      if (!reserve) continue;

      reserves.push({
        address: reserve.address,
        token0: reserve.token0 ?? '',
        token1: reserve.token1 ?? '',
        reserve0: reserve.reserve0?.toString() ?? '0',
        reserve1: reserve.reserve1?.toString() ?? '0',
      });
    } catch (error) {
      console.error(`Error getting reserves for pool ${pool.poolAddress}:`, error);
    }
  }

  console.log('Reserves received:', reserves.length);
  await poolsService.updateReserves(reserves);
}

