/**
 * profit в base токене (tokenIn step0)
 * baseAmount = сколько base хотим вернуть (обычно это buy.step0.amountIn)
 * quoteIn    = сколько quote нужно, чтобы вернуть baseAmount (sell step1 exactOut)
 */
export function calcProfitBaseSigned(params: {
  baseAmount: bigint; // base, который хотим вернуть (обычно step0.amountIn)
  quoteOut: bigint;   // step0.amountOut
  quoteIn: bigint;    // step1.amountIn (exactOut sell)
}): bigint {
  const { baseAmount, quoteOut, quoteIn } = params;
  if (quoteIn === 0n) throw new Error('quoteIn is zero');

  const profitQuote = quoteOut - quoteIn; // может быть отрицательным
  // profitBase = profitQuote * baseAmount / quoteIn
  return (profitQuote * baseAmount) / quoteIn;
}
