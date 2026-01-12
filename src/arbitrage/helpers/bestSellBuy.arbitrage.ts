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
    if (amountOut != null) {
      const out = BigInt(amountOut);
      if (bestBuyOut === null || out > bestBuyOut) {
        bestBuyOut = out;
        bestBuy = q;
      }
    }

    const inStr = q.quote?.quoteExactOutputSingle?.amountIn;
    if (inStr != null) {
      const inn = BigInt(inStr);
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
