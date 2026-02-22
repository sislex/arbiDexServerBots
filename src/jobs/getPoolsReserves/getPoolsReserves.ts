import { EntityManager } from 'typeorm';
import { Chains, Dexes, Pools, Tokens } from '../getPoolsFromFactory/helpers/entities/entities';
import { PoolsService } from '../getPoolsFromFactory/helpers/pools/pools.service';
import { GetV2ReservesHelper } from '../getPoolsFromFactory/helpers/getV2Reserves';
import { GetV3ReservesHelper } from '../getPoolsFromFactory/helpers/getV3Reserves';
import { IConfig, IV2ReserveResponse } from '../getPoolsFromFactory/models';
import { UpdateReservesDto } from '../getPoolsFromFactory/helpers/dtos/pools-dto/pool.dto';
import { runWithContext } from '../getPoolsFromFactory/utils/run-with-context';

export async function getPoolsReserves(deps: { extraSettings?: string }) {
  return runWithContext(deps.extraSettings, async ({ manager, configData, services }) => {
    const v2Helper = new GetV2ReservesHelper();
    const v3Helper = new GetV3ReservesHelper();

    await setReserves(services.pools, v2Helper, v3Helper, configData, manager);

    return { success: true };
  });
}

export async function setReserves(
  poolsService: PoolsService,
  getV2ReservesHelper: GetV2ReservesHelper,
  getV3ReservesHelper: GetV3ReservesHelper,
  configData: IConfig,
  manager: EntityManager,
) {
  const filteredPools = await poolsService.findOldestReserves(
    configData.version,
    1000,
    manager
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

