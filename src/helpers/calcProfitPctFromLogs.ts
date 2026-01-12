/**
 * Считает процент прибыли/убытка по SwapLog[].
 * Возвращает процент * 1e4 (basis points с 4 знаками после запятой).
 *
 * Например:
 *  -1234 => -0.1234 %
 *   2500 =>  0.2500 %
 */
export function calcProfitPctFromLogs(
  logs: {
    index: bigint;
    amountIn: bigint;
    amountOut: bigint;
  }[],
  inPct: boolean = true
): bigint | number {
  if (logs.length < 2) {
    throw new Error("Need at least 2 swap logs");
  }

  const first = logs[0];
  const last = logs[logs.length - 1];

  const inAmount = first.amountIn;
  const outAmount = last.amountOut;

  if (inAmount === 0n) {
    throw new Error("amountIn is zero");
  }

  // (out - in) / in * 100
  // умножаем на 1e4, чтобы вернуть % с 4 знаками после запятой

  let result: bigint | number = ((outAmount - inAmount) * 1_000_000n) / inAmount;

  if (inPct) {
    result = Number(result) / 10000;
  }

  return result;
}
