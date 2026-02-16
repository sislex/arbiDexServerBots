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
import { configCreateCamelotV2, DB } from './config';
import { Chains } from './helpers/entities/entities/Chains';
import { Dexes } from './helpers/entities/entities/Dexes';
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

export interface IConfigDB {
  type: 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql'; // тип БД
  host: string;
  port: number;
  username: string;
  password?: string;
  database: string;
  // Можно добавить дополнительные поля, если используете специфичные настройки
  schema?: string;
  ssl?: boolean | object;
}

// const dataSource = await createDbConnection({
//   ...configDB,
//   // ДОБАВЬТЕ СЮДА Chains и Dexes!
//   entities: [Pools, Tokens, Chains, Dexes],
//   synchronize: false,
// });
export const createDbConnection = async (config: DataSourceOptions) => {
  const ds = new DataSource(config);
  return await ds.initialize();
};
export const closeDbConnection = async (ds: DataSource) => {
  if (ds && ds.isInitialized) {
    await ds.destroy();
  }
};

const logger = new Logger('BlockchainLogic');

export async function getPoolsFromFactory(deps: {
  tokensService: TokensService;
  poolsService: PoolsService;
  getV2ReservesHelper: GetV2ReservesHelper;
  getV3ReservesHelper: GetV3ReservesHelper;
  configData?: IConfig; // Сделали опциональным для деструктуризации
  configDB?: IConfigDB;
}) {
  // 1. Деструктуризация ПЕРВОЙ строкой.
  // Если в deps нет configDB, возьмется импортированный DB
  const {
    tokensService,
    poolsService,
    getV2ReservesHelper,
    getV3ReservesHelper,
    configData = configCreateCamelotV2,
    configDB = DB
  } = deps;

  // 2. Теперь проверяем уже извлеченную переменную configDB, а не deps.configDB
  if (!configDB) {
    console.error('!!! Ошибка: Конфигурация БД не найдена');
    return { success: false, error: 'No configDB provided' };
  }

  console.log('--- [START] getPoolsFromFactory ---');
  console.log('Используемая БД:', configDB.database);

  let dataSource: DataSource | undefined;

  try {
    console.log('--- [2] Попытка открыть соединение с БД:', configDB.database, 'на хосте:', configDB.host);

    // 1. ОТКРЫВАЕМ соединение (ОБЯЗАТЕЛЬНО добавляем все 4 сущности)
    dataSource = await createDbConnection({
      ...configDB,
      entities: [Pools, Tokens, Chains, Dexes],
      synchronize: false,
      connectTimeoutMS: 15000, // Тайм-аут 15 сек, чтобы не висело вечно
    } as any);

    const manager = dataSource.manager;
    console.log('--- [3] Соединение установлено! Переходим к блокчейну... ---');

    // 2. Получение пулов из блокчейна
    let pools: any[] = [];
    if (configData.dexName === 'camelot' && configData.version === 'v3') {
      pools = await getCamelotV3PoolsFromFactory(configData.factoryAddress, configData.start, configData.finish);
    } else if (configData.version === 'v3') {
      pools = await getUniswapV3PoolsFromFactory(configData.factoryAddress, configData.start, configData.finish);
    } else if (configData.version === 'v2') {
      pools = await getV2PoolsFromFactory(configData.factoryAddress, configData.start, configData.finish);
    }

    console.log(`--- [4] Получено пулов из сети: ${pools?.length || 0} ---`);
    if (!pools || pools.length === 0) return { success: true, message: 'No pools found' };

    const uniqueTokens = getUniqueTokens(pools);
    console.log('--- [5] Уникальных токенов обнаружено:', uniqueTokens.length);

    // 3. Обработка данных с пробросом manager
    const newTokenAddresses = await filterNewTokenAddresses(uniqueTokens, tokensService, manager);
    console.log('--- [6] Новых токенов для сохранения:', newTokenAddresses.length);

    const tokensData = await fetchTokensData(newTokenAddresses);
    const tokensToSave = tokensData.map((t) => ({ ...t, chainId: 42161 }));

    await saveTokensIfNotExist(tokensToSave, tokensService, manager);
    const tokenMap = await buildTokenMap(tokensService, manager);
    const existingPools = await getExistingPoolsSet(poolsService, manager);

    console.log('--- [7] Создание пулов в базе... ---');
    const createdPools = await createPools(pools, tokenMap, existingPools, configData, poolsService, manager);
    console.log(`--- [8] Создано новых записей в БД: ${createdPools.length} ---`);

    // 4. Обновление резервов
    console.log('--- [9] Обновление резервов... ---');
    await setReserves(poolsService, getV2ReservesHelper, getV3ReservesHelper, configData, manager);

    console.log('--- [DONE] Все операции успешно завершены ---');
    return createdPools; // Возвращаем массив (для корректной работы Job)

  } catch (error) {
    console.error('!!! КРИТИЧЕСКАЯ ОШИБКА в getPoolsFromFactory:', error.message);
    console.error(error.stack); // Выводим стек ошибки для отладки
    throw error;
  } finally {
    // 5. ЗАКРЫВАЕМ соединение
    if (dataSource) {
      await closeDbConnection(dataSource);
      console.debug('--- [FINALLY] Соединение с динамической БД закрыто ---');
    }
  }
}

export async function filterNewTokenAddresses(
  tokenAddresses: string[],
  tokensService: TokensService,
  manager: EntityManager,
): Promise<string[]> {
  console.log('existingTokens::::');

  const existingTokens = await tokensService.findAll(manager);
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
  manager: EntityManager
): Promise<Map<string, number>> {
  const tokens = await tokensService.findAll(manager);

  return new Map(tokens.map((t) => [t.address.toLowerCase(), t.tokenId]));
}

export async function getExistingPoolsSet(
  poolsService: PoolsService,
  manager: EntityManager
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
  manager: EntityManager
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
      const savedPool = await poolsService.create({
        token0: token0Id,
        token1: token1Id,
        poolAddress,
        fee: pool.fee ?? config.fee,
        version: config.version ?? 'v4',
        dexId: config.dexId,
        chainId: 42161,
      }, manager); // ОБЯЗАТЕЛЬНО передаем manager здесь

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
  await poolsService.updateReserves(reserves, manager);
}
