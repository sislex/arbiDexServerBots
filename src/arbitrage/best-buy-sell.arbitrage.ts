import {IPairQuoteResult} from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import {groupPairQuotes} from './helpers/groupPairQuotes.helper';
import {bestSellBuyArbitrage} from './helpers/bestSellBuy.arbitrage';

export interface IBestBuySellArbitrage {
  hasArbitrage: boolean;
  arbNumber: number;
  groups: any[];
}

export function bestBuySellArbitrage(quotes: IPairQuoteResult[], testMode = false): IBestBuySellArbitrage {
  const groupedQuotes = groupPairQuotes(quotes);

  const groups: any = [];
  let arbNumber = 0;
  let hasArb = false;

  for (const key in groupedQuotes) {
    const quotes = groupedQuotes[key];
    if (quotes.length > 1) {
      const bestSellBuy = bestSellBuyArbitrage(quotes);
      const tokenIn =  quotes[0].pair.tokenIn;
      const tokenOut =  quotes[0].pair.tokenOut;
      const amountIn = quotes[0].pair.amount;

      // spread может быть undefined → учитываем
      hasArb = bestSellBuy.spread_pct !== undefined && bestSellBuy.spread_pct > 0;

      if (testMode || hasArb) {
        arbNumber++;

        groups.push({
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          amountIn,
          poolsCount: quotes.length,
          spread_pct: bestSellBuy.spread_pct,
          bestBuyPool: bestSellBuy.bestBuyPool,
          bestSellPool: bestSellBuy.bestSellPool,
        });
      }
    }
  }

  const results: IBestBuySellArbitrage= {
    hasArbitrage:  testMode || hasArb,
    arbNumber,
    groups,
  };

  return results;
}
