import { IPairQuoteResult } from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import { groupPairQuotes } from './helpers/groupPairQuotes.helper';
import { bestSellBuyArbitrage } from './helpers/bestSellBuy.arbitrage';
import {
  ITokenInfo,
  IPairToQuote,
} from '../store/state.types';

import type {
  QuoteExactInputSingleRaw,
  QuoteExactOutputSingleRaw,
} from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';

export interface IGroupedQuotes {
  key: string;

  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amountIn: string;

  poolsCount: number;

  // метрики
  spread_pct?: number;
  spread_bps?: number;

  // полезно для твоего 2-step алгоритма:
  // profitOutToken = amountOut - amountIn (в tokenOut, smallest units)
  amountOut?: string;       // bestSell exactIn -> out
  amountInBuy?: string;     // bestBuy exactOut -> in
  profitOutToken?: string;

  // ✅ котировки (по которым выбрали bestBuy/bestSell)
  bestSellQuote?: QuoteExactInputSingleRaw | null;   // quoteExactInputSingle
  bestBuyQuote?: QuoteExactOutputSingleRaw | null;   // quoteExactOutputSingle

  // выбранные пулы
  bestBuyPool?: IPairToQuote | null;
  bestSellPool?: IPairToQuote | null;
}

export interface IBestBuySellArbitrage {
  hasArbitrage: boolean;
  arbNumber: number;
  groups: IGroupedQuotes[];
}

export function bestBuySellArbitrage(
  quotes: IPairQuoteResult[],
  testMode = false
): IBestBuySellArbitrage {
  const grouped = groupPairQuotes(quotes);

  const groups: IGroupedQuotes[] = [];
  let hasArbitrage = !!testMode;

  for (const key in grouped) {
    const groupQuotes = grouped[key];
    if (groupQuotes.length <= 1) continue;

    const r = bestSellBuyArbitrage(groupQuotes);

    const tokenIn = groupQuotes[0].pair.tokenIn;
    const tokenOut = groupQuotes[0].pair.tokenOut;
    const amountIn = groupQuotes[0].pair.amount;

    const groupHasArb = (r.spread_pct ?? 0) > 0;
    hasArbitrage = hasArbitrage || groupHasArb;

    if (testMode || groupHasArb) {
      console.log(groupQuotes);

      groups.push({
        key,
        tokenIn,
        tokenOut,
        amountIn,
        poolsCount: groupQuotes.length,

        spread_pct: r.spread_pct,
        spread_bps: r.spread_bps,

        amountOut: r.amountOut,
        amountInBuy: r.amountIn,
        profitOutToken: r.profitOutToken,

        // ✅ прокидываем котировки
        bestSellQuote: r.bestSellQuote ?? null,
        bestBuyQuote: r.bestBuyQuote ?? null,

        bestBuyPool: r.bestBuyPool ?? null,
        bestSellPool: r.bestSellPool ?? null,
      });
    }
  }

  return {
    hasArbitrage,
    arbNumber: groups.length,
    groups,
  };
}
