import {
  IPairQuoteResult,
  QuoteExactInputSingleRaw,
  QuoteExactOutputSingleRaw,
} from '../../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import { IPairToQuote } from '../../store/state.types';

export interface IBestSellBuyResult {
  amountOut?: string;     // bestSell exactIn -> out
  amountIn?: string;      // bestBuy exactOut -> in
  spread_pct?: number;    // %
  spread_bps?: number;    // basis points (1 bps = 0.01%)

  profitOutToken?: string; // (amountOut - amountIn) в tokenOut (quote token), smallest units

  bestSellPool?: IPairToQuote | null;
  bestBuyPool?: IPairToQuote | null;

  // ✅ котировки, по которым выбрали bestSell/bestBuy
  bestSellQuote?: QuoteExactInputSingleRaw | null;   // quoteExactInputSingle (amountOut, ...)
  bestBuyQuote?: QuoteExactOutputSingleRaw | null;   // quoteExactOutputSingle (amountIn, ...)
}

export function bestSellBuyArbitrage(pairQuote: IPairQuoteResult[]): IBestSellBuyResult {
  let bestSell: IPairQuoteResult | null = null;
  let bestBuy: IPairQuoteResult | null = null;

  let bestSellOut: bigint | null = null; // max(amountOut)
  let bestBuyIn: bigint | null = null;   // min(amountIn)

  for (const q of pairQuote) {
    const outStr = q.quote?.quoteExactInputSingle?.amountOut;
    if (outStr != null) {
      const out = BigInt(outStr);
      if (bestSellOut === null || out > bestSellOut) {
        bestSellOut = out;
        bestSell = q;
      }
    }

    const inStr = q.quote?.quoteExactOutputSingle?.amountIn;
    if (inStr != null) {
      const inn = BigInt(inStr);
      if (bestBuyIn === null || inn < bestBuyIn) {
        bestBuyIn = inn;
        bestBuy = q;
      }
    }
  }

  // нет данных для сравнения
  if (!bestSell || !bestBuy || bestSellOut === null || bestBuyIn === null) {
    return {
      bestSellPool: bestSell?.pair ?? null,
      bestBuyPool: bestBuy?.pair ?? null,
      bestSellQuote: bestSell?.quote?.quoteExactInputSingle ?? null,
      bestBuyQuote: bestBuy?.quote?.quoteExactOutputSingle ?? null,
    };
  }

  if (bestBuyIn === 0n) {
    return {
      amountOut: bestSellOut.toString(),
      amountIn: bestBuyIn.toString(),
      spread_pct: undefined,
      spread_bps: undefined,
      profitOutToken: undefined,

      bestSellPool: bestSell.pair,
      bestBuyPool: bestBuy.pair,
      bestSellQuote: bestSell.quote?.quoteExactInputSingle ?? null,
      bestBuyQuote: bestBuy.quote?.quoteExactOutputSingle ?? null,
    };
  }

  const diff = bestSellOut - bestBuyIn;

  // bps = diff / buyIn * 10_000
  const spreadBpsBI = (diff * 10000n) / bestBuyIn;
  const spread_bps = Number(spreadBpsBI);

  // pct = bps / 100
  const spread_pct = spread_bps / 100;

  return {
    amountOut: bestSellOut.toString(),
    amountIn: bestBuyIn.toString(),
    spread_pct,
    spread_bps,
    profitOutToken: diff.toString(),

    bestSellPool: bestSell.pair,
    bestBuyPool: bestBuy.pair,

    // ✅ вот они — “по каким котировкам”
    bestSellQuote: bestSell.quote?.quoteExactInputSingle ?? null,
    bestBuyQuote: bestBuy.quote?.quoteExactOutputSingle ?? null,
  };
}
