/**
 * Процент прибыли в base-токене (tokenIn первого шага)
 * signed, точность: 6 знаков после запятой
 */
export function calcProfitPctFromBase(
  profitBase: bigint,
  baseAmount: bigint
): number {
  if (baseAmount === 0n) {
    throw new Error('baseAmount is zero');
  }

  // pct = profit / base * 100
  // scale = 1e6 (6 знаков после запятой)
  const SCALE = 1_000_000n;

  return Number((profitBase * 100n * SCALE) / baseAmount) / Number(SCALE);
}
