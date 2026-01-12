import {IArbitrage, IPairToQuote, ITokenInfo} from '../store/state.types';

import type {
  QuoteExactInputSingleRaw,
  QuoteExactOutputSingleRaw,
} from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';

export interface IParsedArbitrage {
  createdAt: string;
  blockNumber: number;

  tokenIn?: ITokenInfo;
  tokenOut?: ITokenInfo;

  amountIn?: string;

  spread_pct?: number;
  spread_bps?: number;

  amountOut?: string;
  amountInBuy?: string;
  profitOutToken?: string;

  bestBuyPool?: IPairToQuote | null;
  bestSellPool?: IPairToQuote | null;
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

        tokenIn: group.bestArbitrage.bestBuy?.pair.tokenIn,
        tokenOut: group.bestArbitrage.bestBuy?.pair.tokenOut,

        amountIn: group.bestArbitrage.bestBuy?.pair.amount,

        spread_pct: group.spread_pct,
        spread_bps: group.spread_bps,

        bestBuyPool: group.bestArbitrage.bestBuy?.pair ?? null,
        bestSellPool: group.bestArbitrage.bestSell?.pair ?? null,
      });
    }
  }

  return parsed;
};
