/**
 * amount * (10000 + slippageBps) / 10000, округление вверх.
 * Нужна для amountInMax (EXACT_OUT), чтобы не словить SLIPPAGE.
 */
export function addSlippageCeil(amount: bigint, slippageBps: number): bigint {
  if (slippageBps <= 0) return amount;
  const num = amount * BigInt(10_000 + slippageBps);
  const den = 10_000n;
  return (num + den - 1n) / den; // ceil
}
