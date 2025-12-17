import {IPairQuoteResult} from '../../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import {IPairToQuote} from '../../store/state.types';

export interface IBestSellBuyResult {
  amountOut?: string;
  amountIn?: string;
  spread_pct?: number;

  bestSellPool?: IPairToQuote | null;
  bestBuyPool?: IPairToQuote | null;
}

export function bestSellBuyArbitrage(pairQuote: IPairQuoteResult[]): IBestSellBuyResult {
  let bestSell: IPairQuoteResult | null = null;
  let bestBuy: IPairQuoteResult | null = null;

  for (const q of pairQuote) {
    const exactInOut = q.quote?.quoteExactInputSingle?.amountOut;
    const exactOutIn = q.quote?.quoteExactOutputSingle?.amountIn;

    // Лучшая продажа — max(amountOut)
    if (exactInOut !== undefined) {
      const outBI = BigInt(exactInOut);
      if (!bestSell || outBI > BigInt(bestSell.quote!.quoteExactInputSingle.amountOut)) {
        bestSell = q;
      }
    }

    // Лучшая покупка — min(amountIn)
    if (exactOutIn !== undefined) {
      const inBI = BigInt(exactOutIn);
      if (!bestBuy || inBI < BigInt(bestBuy.quote!.quoteExactOutputSingle!.amountIn)) {
        bestBuy = q;
      }
    }
  }

  if (!bestSell || !bestBuy) {
    return {
      amountOut: undefined,
      amountIn: undefined,
      spread_pct: undefined,
      bestSellPool: bestSell?.pair,
      bestBuyPool: bestBuy?.pair,
    };
  }

  const bestSellOut = BigInt(bestSell.quote!.quoteExactInputSingle.amountOut);
  const bestBuyIn = BigInt(bestBuy.quote!.quoteExactOutputSingle!.amountIn);

  // spread = (sellOut - buyIn) / buyIn * 100
  const spreadPct =
    Number((bestSellOut - bestBuyIn) * 10000n / bestBuyIn) / 100; // безопасный способ

  return {
    amountOut: bestSellOut.toString(),
    amountIn: bestBuyIn.toString(),
    spread_pct: spreadPct,
    bestBuyPool: bestBuy.pair,
    bestSellPool: bestSell.pair,
  };
}
