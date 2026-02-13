import { fetchTokensData, getUniqueTokens } from './helpers/getTokensData';
import { getV2PoolsFromFactory } from './helpers/getV2PoolsFromFactory';
// import { GetV2ReservesHelper } from './helpers/getV2Reserves';
// import { GetV3ReservesHelper } from './helpers/getV3Reserves';
import {
  // configCreateCamelotV2,
  // configCreateCamelotV3,
  // configCreateSushiV2,
  // configCreateSushiV3,
  configCreateUniswapV2,
  // configCreateUniswapV3,
} from './config';
import { Tokens } from './helpers/entities/entities/Tokens';
import { CreateTokenDto } from './helpers/dtos/token-dto/token.dto';
import { TokensService } from './helpers/tokens/tokens.service';
import { PoolsService } from './helpers/pools/pools.service';
import { Pools } from './helpers/entities/entities/Pools';
import { PoolDto, UpdateReservesDto } from './helpers/dtos/pools-dto/pool.dto';
import { GetV2ReservesHelper } from './helpers/getV2Reserves';
import { Logger } from '@nestjs/common';

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
}
interface IV2ReserveResponse {
  address: string;
  token0: string;
  token1: string;
  reserve0: bigint | number | string; // зависит от того, что возвращает ваш провайдер
  reserve1: bigint | number | string;
}

const logger = new Logger('BlockchainLogic');

export async function getPoolsFromFactory(deps: {
  tokensService: TokensService;
  poolsService: PoolsService;
  getV2ReservesHelper: GetV2ReservesHelper;
}) {
  const { tokensService, poolsService, getV2ReservesHelper } = deps;

  // меняем configData --- вызываемый метод получения pools --- версию получаемых резервов, сервис и его метод
  const configData = configCreateUniswapV2;

  // const pools = await getUniswapV3PoolsFromFactory(configData.factoryAddress, 1, );
  // const pools = await getCamelotV3PoolsFromFactory(configData.factoryAddress, 1,  );
  const pools = await getV2PoolsFromFactory(
    configData.factoryAddress,
    1,
    220000010,
  );

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

  await setReserves(poolsService, getV2ReservesHelper);

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
    const poolAddress = pool.pool?.toLowerCase(); // pair/pool для v2/v3
    const token0Address = pool.token0?.toLowerCase();
    const token1Address = pool.token1?.toLowerCase();

    if (!poolAddress || !token0Address || !token1Address) {
      logger.warn(
        `Skipped pool with empty address or tokens: ${JSON.stringify(pool)}`,
      );
      continue;
    }

    if (existingPools.has(poolAddress)) continue;

    const token0Id = tokenMap.get(token0Address);
    const token1Id = tokenMap.get(token1Address);

    if (!token0Id || !token1Id) {
      logger.warn(
        `No tokens found for the pool ${poolAddress}: ` +
          `token0=${token0Address} (${token0Id}), ` +
          `token1=${token1Address} (${token1Id})`,
      );
      continue;
    }

    const poolDto: PoolDto = {
      token0: token0Id,
      token1: token1Id,
      poolAddress,
      fee: pool.fee ?? config.fee,
      version: config.version || 'v4',
      dexId: config.dexId,
      chainId: 42161,
    };

    try {
      const savedPool = await poolsService.create(poolDto);
      createdPools.push(savedPool);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      logger.error(`Error creating pool ${poolAddress}: ${errorMessage}`);
    }
  }

  return createdPools;
}

export async function setReserves(
  poolsService: PoolsService,
  getV2ReservesHelper: GetV2ReservesHelper,
) {
  const pools = await poolsService.findAll();

  const filteredPools = pools.filter(
    (pool) =>
      (pool.reserve0 === null || pool.reserve1 === null) &&
      pool.version === 'v2',
  );
  const reserves: UpdateReservesDto[] = [];

  for (const pool of filteredPools) {
    try {
      const reserve = (await getV2ReservesHelper.getV2Reserves(
        pool.poolAddress as `0x${string}`,
      )) as IV2ReserveResponse | null;

      if (!reserve) continue;

      const dto: UpdateReservesDto = {
        address: reserve.address,
        token0: reserve.token0,
        token1: reserve.token1,
        reserve0: reserve.reserve0?.toString() ?? '0',
        reserve1: reserve.reserve1?.toString() ?? '0',
      };

      reserves.push(dto);
    } catch (error) {
      console.error(
        `Error getting reserves for pool ${pool.poolAddress}:`,
        error,
      );
    }
  }

  console.log('Reserves received:', reserves);
  await poolsService.updateReserves(reserves);
}
