export function calcProfitPctFromTwoSwaps(
  amountIn0: bigint,
  amountOut1: bigint
): number {
  if (amountIn0 === 0n) {
    throw new Error('amountIn0 is zero');
  }

  const profitBase = amountOut1 - amountIn0;
  const SCALE = 1_000_000n; // 6 знаков

  return Number((profitBase * 100n * SCALE) / amountIn0) / Number(SCALE);
}
