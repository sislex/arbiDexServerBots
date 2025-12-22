import {IPairQuoteResult} from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import {groupPairQuotes} from './helpers/groupPairQuotes.helper';
import {bestSellBuyArbitrage} from './helpers/bestSellBuy.arbitrage';

export interface IBestBuySellArbitrage {
  hasArbitrage: boolean;
  arbNumber: number;
  groups: any[];
}
export function bestBuySellArbitrage(
  quotes: IPairQuoteResult[],
  testMode = false
): IBestBuySellArbitrage {
  const groupedQuotes = groupPairQuotes(quotes);

  const groups: any[] = [];
  let arbNumber = 0;
  let hasArb = false;

  for (const key in groupedQuotes) {
    const groupQuotes = groupedQuotes[key];
    if (groupQuotes.length <= 1) continue;

    const bestSellBuy = bestSellBuyArbitrage(groupQuotes);

    const tokenIn = groupQuotes[0].pair.tokenIn;
    const tokenOut = groupQuotes[0].pair.tokenOut;
    const amountIn = groupQuotes[0].pair.amount;

    const groupHasArb =
      bestSellBuy.spread_pct !== undefined && bestSellBuy.spread_pct > 0;

    // аккумулируем по всем группам, а не перезаписываем
    hasArb = hasArb || groupHasArb;

    if (testMode || groupHasArb) {
      arbNumber++;

      groups.push({
        tokenIn,
        tokenOut,
        amountIn,
        poolsCount: groupQuotes.length,
        spread_pct: bestSellBuy.spread_pct,
        bestBuyPool: bestSellBuy.bestBuyPool,
        bestSellPool: bestSellBuy.bestSellPool,
      });
    }
  }

  return {
    hasArbitrage: testMode || hasArb,
    arbNumber,
    groups,
  };
}
