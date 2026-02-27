import { EntityManager } from 'typeorm';
import { PoolsService } from '../getPoolsFromFactory/helpers/pools/pools.service';
import { GetV2ReservesHelper } from '../getPoolsFromFactory/helpers/getV2Reserves';
import { GetV3ReservesHelper } from '../getPoolsFromFactory/helpers/getV3Reserves';
import { IConfig } from '../getPoolsFromFactory/models';
import { UpdateReservesDto } from '../getPoolsFromFactory/helpers/dtos/pools-dto/pool.dto';
import { runWithContext } from '../getPoolsFromFactory/utils/run-with-context';

export async function getPoolsReserves(deps: { extraSettings?: string }) {
  return runWithContext(
    deps.extraSettings,
    async ({ manager, configData, services }) => {
      const v2Helper = new GetV2ReservesHelper();
      const v3Helper = new GetV3ReservesHelper();

      await setReserves(
        services.pools,
        v2Helper,
        v3Helper,
        configData,
        manager,
      );

      return { success: true };
    },
  );
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
    manager,
  );

  if (filteredPools.length === 0) return;

  console.log('---[Processing pools]---', filteredPools.length);

  const poolAddresses = filteredPools
    .map((pool) => pool.poolAddress as `0x${string}`)
    .filter(Boolean);

  const fetchedReserves =
    configData.version === 'v2'
      ? await getV2ReservesHelper.getV2Reserves(configData.chainId, poolAddresses)
      : await getV3ReservesHelper.getV3Reserves(configData.chainId, poolAddresses);

  const reserves: UpdateReservesDto[] = fetchedReserves
    .filter((reserve): reserve is NonNullable<typeof reserve> => !!reserve) // Явная проверка на null
    .map((reserve) => ({
      address: reserve.address,
      chainId: configData.chainId,
      token0: reserve.token0 ?? '',
      token1: reserve.token1 ?? '',
      reserve0: reserve.reserve0,
      reserve1: reserve.reserve1,
    }));

  console.log('---[Reserves Ready]---', reserves.length);

  if (reserves.length > 0) {
    await poolsService.updateReserves(reserves, manager);
    console.log('---[Reserves Saved]---');
  }
}

