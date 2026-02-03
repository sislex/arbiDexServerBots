import {
  IPairQuoteResult,
} from '../../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import {IBestArbitrageByGroup} from '../../store/state.types';


export function bestArbitrageByGroup(pairQuote: IPairQuoteResult[]): IBestArbitrageByGroup {
  let bestBuy: IPairQuoteResult | null = null;
  let bestSell: IPairQuoteResult | null = null;

  let bestBuyOut: bigint | null = null; // max(amountOut)
  let bestSellIn: bigint | null = null;   // min(amountIn)

  for (const q of pairQuote) {
    const amountOut = q.quote?.quoteExactInputSingle?.amountOut;
    // console.log('amountOut', amountOut, q.pair.dex, q.pair.feePpm, q.pair.tokenIn.address);
    if (amountOut != null) {
      const out = BigInt(amountOut);
      if (bestBuyOut === null || out > bestBuyOut) {
        bestBuyOut = out;
        bestBuy = q;
      }
    }

    const amountIn = q.quote?.quoteExactOutputSingle?.amountIn;
    // console.log('amountIn', q.pair.dex, q.pair.feePpm, amountIn, q.pair.tokenOut.address);
    if (amountIn != null) {
      const inn = BigInt(amountIn);
      if (bestSellIn === null || inn < bestSellIn) {
        bestSellIn = inn;
        bestSell = q;
      }
    }
  }

  return {
    bestBuy: bestBuy,
    bestSell: bestSell,
  };
}
