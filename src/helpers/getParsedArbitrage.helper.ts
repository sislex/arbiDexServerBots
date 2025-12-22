import {IArbitrage} from './createArbitrage';
import {IPairToQuote, ITokenInfo} from '../store/state.types';

import type {
  QuoteExactInputSingleRaw,
  QuoteExactOutputSingleRaw,
} from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';

export interface IParsedArbitrage {
  createdAt: string;
  blockNumber: number;

  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;

  amountIn: string;
  poolsCount: number;

  spread_pct?: number;
  spread_bps?: number;

  amountOut?: string;
  amountInBuy?: string;
  profitOutToken?: string;

  bestBuyPool?: IPairToQuote | null;
  bestSellPool?: IPairToQuote | null;

  // ✅ котировки, по которым выбрали bestBuy/bestSell
  bestSellQuote?: QuoteExactInputSingleRaw | null; // quoteExactInputSingle
  bestBuyQuote?: QuoteExactOutputSingleRaw | null; // quoteExactOutputSingle
}
export const getParsedArbitrage = (
  arbitrageList: IArbitrage[]
): IParsedArbitrage[] => {
  const parsed: IParsedArbitrage[] = [];

  for (const arbitrage of arbitrageList) {
    const { createdAt, blockNumber } = arbitrage;

    for (const group of arbitrage.groups) {
      parsed.push({
        createdAt,
        blockNumber,

        tokenIn: group.tokenIn,
        tokenOut: group.tokenOut,

        amountIn: group.amountIn,
        poolsCount: group.poolsCount,

        spread_pct: group.spread_pct,
        spread_bps: group.spread_bps,

        amountOut: group.amountOut,
        amountInBuy: group.amountInBuy,
        profitOutToken: group.profitOutToken,

        bestBuyPool: group.bestBuyPool ?? null,
        bestSellPool: group.bestSellPool ?? null,

        // ✅ вот оно
        bestSellQuote: group.bestSellQuote ?? null,
        bestBuyQuote: group.bestBuyQuote ?? null,
      });
    }
  }

  return parsed;
};
