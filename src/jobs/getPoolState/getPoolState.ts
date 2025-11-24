import { ethers } from "ethers";
import { PoolState, PoolTickState } from "./getPoolState.types";
import { IJobParams_get_Pool_State } from "../../store/state.types";

// минимальный ABI пула V3
const UNISWAP_V3_POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
  "function liquidity() external view returns (uint128)",
  "function tickSpacing() external view returns (int24)",
  "function fee() external view returns (uint24)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function tickBitmap(int16 wordPosition) external view returns (uint256)",
  "function ticks(int24 tick) external view returns (uint128 liquidityGross,int128 liquidityNet,uint256 feeGrowthOutside0X128,uint256 feeGrowthOutside1X128,int56 tickCumulativeOutside,uint160 secondsPerLiquidityOutsideX128,uint32 secondsOutside,bool initialized)"
];

// Multicall3 (Arbitrum One)
const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";
const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
];

export async function getPoolState(
  params: IJobParams_get_Pool_State,
): Promise<PoolState> {
  const {
    rpcUrl,
    poolAddress,
    wordsAround = 2,
    maxTicks = 512,
  } = params;

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const poolAddr = ethers.getAddress(poolAddress);
  const pool = new ethers.Contract(poolAddr, UNISWAP_V3_POOL_ABI, provider);
  const multicall = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);

  // ---- параллельно читаем базовое состояние (это мало и быстро)
  const [
    slot0,
    liquidity,
    tickSpacing,
    fee,
    token0,
    token1
  ] = await Promise.all([
    pool.slot0(),
    pool.liquidity(),
    pool.tickSpacing(),
    pool.fee(),
    pool.token0(),
    pool.token1()
  ]);

  const sqrtPriceX96 = slot0[0] as bigint;
  const tick = Number(slot0[1]);
  const observationCardinality = Number(slot0[3]);
  const observationCardinalityNext = Number(slot0[4]);

  const spacing = Number(tickSpacing); // int24
  const feeNum = Number(fee);

  // ---- вычисляем нужные wordPosition
  const compressTick = (t: number) => Math.floor(t / spacing);
  const currentCompressed = compressTick(tick);
  const currentWordPos = Math.floor(currentCompressed / 256); // int16

  const wordPositions: number[] = [];
  for (let w = currentWordPos - wordsAround; w <= currentWordPos + wordsAround; w++) {
    wordPositions.push(w);
  }

  // ============================
  // 1) Multicall для tickBitmap
  // ============================
  const bitmapCalls = wordPositions.map((w) => ({
    target: poolAddr,
    callData: pool.interface.encodeFunctionData("tickBitmap", [w]),
  }));

  const [, bitmapReturnData]: [bigint, string[]] =
    await multicall.getFunction("aggregate").staticCall(bitmapCalls);

  // парсим bitmap word'ы
  const bitmaps: bigint[] = bitmapReturnData.map((bytes) => {
    const decoded = pool.interface.decodeFunctionResult("tickBitmap", bytes);
    return decoded[0] as bigint;
  });

  // ---- собираем tickIndex'ы из bitmap (без RPC)
  const ticksToFetch: number[] = [];
  const tickFromCompressed = (compressed: number) => compressed * spacing;

  for (let i = 0; i < wordPositions.length; i++) {
    const w = wordPositions[i];
    const word = bitmaps[i];

    if (word === 0n) continue;

    for (let bit = 0; bit < 256; bit++) {
      if (ticksToFetch.length >= maxTicks) break;

      const mask = 1n << BigInt(bit);
      if ((word & mask) === 0n) continue;

      const compressed = w * 256 + bit;
      const tickIndex = tickFromCompressed(compressed);
      ticksToFetch.push(tickIndex);
    }

    if (ticksToFetch.length >= maxTicks) break;
  }

  // ============================
  // 2) Multicall для ticks(...)
  // ============================
  let ticks: PoolTickState[] = [];

  if (ticksToFetch.length > 0) {
    const tickCalls = ticksToFetch.map((t) => ({
      target: poolAddr,
      callData: pool.interface.encodeFunctionData("ticks", [t]),
    }));

    const [, ticksReturnData]: [bigint, string[]] =
      await multicall.getFunction("aggregate").staticCall(tickCalls);

    ticks = ticksReturnData.map((bytes, idx) => {
      const decoded = pool.interface.decodeFunctionResult("ticks", bytes);

      // decoded: (liquidityGross, liquidityNet, feeGrowthOutside0X128, feeGrowthOutside1X128, tickCumulativeOutside, secondsPerLiquidityOutsideX128, secondsOutside, initialized)
      const liquidityGross = decoded[0] as bigint;
      const liquidityNet = decoded[1] as bigint;
      const initialized = Boolean(decoded[7]);

      return {
        index: ticksToFetch[idx],
        liquidityGross: liquidityGross.toString(),
        liquidityNet: liquidityNet.toString(),
        initialized,
      };
    });
  }

  // сортируем по индексу тика
  ticks.sort((a, b) => a.index - b.index);

  return {
    poolAddress: poolAddr,

    token0: ethers.getAddress(token0),
    token1: ethers.getAddress(token1),
    fee: feeNum,
    tickSpacing: spacing,

    sqrtPriceX96: sqrtPriceX96.toString(),
    tick,
    liquidity: (liquidity as bigint).toString(),

    observationCardinality,
    observationCardinalityNext,

    ticksScanned: ticks.length,
    ticks
  };
}
