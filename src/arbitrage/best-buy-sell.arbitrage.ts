import { IPairQuoteResult } from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import { groupPairQuotes } from './helpers/groupPairQuotes.helper';
import {bestArbitrageByGroup} from './helpers/bestSellBuy.arbitrage';
import {IBestArbitrageByGroup, IBestBuySellArbitrage, IGroupedQuotes} from '../store/state.types';
import {calculateFinalAmountOut} from '../helpers/calculateFinalAmountOut';


export function bestBuySellArbitrage(
  quotes: IPairQuoteResult[],
  testMode = false
): IBestBuySellArbitrage {
  // console.log(quotes);

  const grouped = groupPairQuotes(quotes);


  const groups: IGroupedQuotes[] = [];
  let hasArbitrage = !!testMode;

  for (const key in grouped) {
      const groupQuotes = grouped[key];

      const bestArbitrage: IBestArbitrageByGroup = bestArbitrageByGroup(groupQuotes);

      // console.log('bestArbitrage', bestArbitrage.bestSell);

      // console.log(
      //   {
      //     bestBuy: {
      //       dex: bestArbitrage.bestBuy?.pair.dex,
      //       feePpm: bestArbitrage.bestBuy?.pair.feePpm,
      //       amountOut: bestArbitrage.bestBuy?.quote?.quoteExactInputSingle?.amountOut,
      //     },
      //     bestSell: {
      //       dex: bestArbitrage.bestSell?.pair.dex,
      //       feePpm: bestArbitrage.bestSell?.pair.feePpm,
      //       amountIn: bestArbitrage.bestSell?.quote?.quoteExactOutputSingle?.amountIn,
      //     },
      //   }
      // );

      const amountInStep0 = BigInt(bestArbitrage.bestBuy?.pair.amount ?? '0');
      const amountOutStep0 = BigInt(bestArbitrage.bestBuy?.quote?.quoteExactInputSingle?.amountOut ?? '0');
      const amountInStep1 = BigInt(bestArbitrage.bestSell?.quote?.quoteExactOutputSingle?.amountIn ?? '0');

      const amountOutStep1 = calculateFinalAmountOut(
        amountInStep0,
        amountOutStep0,
        amountInStep1,
      );

      const diff = amountOutStep1 - amountInStep0;

      const spreadPpmBI = (diff * 1_000_000n) / amountInStep0;

      const spread_ppm = Number(spreadPpmBI);
      const spread_bps = spread_ppm / 100;
      const spread_pct = spread_ppm / 10_000;


      const groupHasArb = (spread_bps ?? 0) > 0;
      hasArbitrage = hasArbitrage || groupHasArb;

      // if (testMode || groupHasArb) {
      //   groups.push({
      //     bestArbitrage,
      //     amountOutStep1,
      //     spread_pct
      //   });
      // }

    groups.push({
      bestArbitrage,
      amountOutStep1,
      spread_pct
    });
  }

  groups.sort((a, b) => b.spread_pct - a.spread_pct);

  return {
    hasArbitrage,
    groups,
  };
}
