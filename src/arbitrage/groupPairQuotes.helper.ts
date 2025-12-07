import {IPairQuoteResult} from '../jobs/getQuote_Arbitrum_UniswapV3_Multi/arbitrum.uniswap-v3-multi.quote';

export function groupPairQuotes(
  quotes: IPairQuoteResult[],
): Record<string, IPairQuoteResult[]> {
  const groups: Record<string, IPairQuoteResult[]> = {};

  for (const q of quotes) {
    const { pair } = q;

    const key =
      pair.tokenIn.address.toLowerCase() +
      '|' +
      pair.tokenOut.address.toLowerCase() +
      '|' +
      pair.amountIn +
      '|' +
      pair.amountOut;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(q);
  }

  return groups;
}
