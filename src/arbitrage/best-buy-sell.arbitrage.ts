import { IPairQuoteResult } from '../jobs/getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import { groupPairQuotes } from './helpers/groupPairQuotes.helper';
import {bestArbitrageByGroup} from './helpers/bestSellBuy.arbitrage';
import {IBestArbitrageByGroup, IBestBuySellArbitrage, IGroupedQuotes} from '../store/state.types';
import {calculateFinalAmountOut} from '../helpers/calculateFinalAmountOut';


export function bestBuySellArbitrage(
  quotes: IPairQuoteResult[],
  testMode = false
): IBestBuySellArbitrage {
  const grouped = groupPairQuotes(quotes);

  const groups: IGroupedQuotes[] = [];
  let hasArbitrage = !!testMode;

  for (const key in grouped) {
    const groupQuotes = grouped[key];

    // console.log('groupQuotes', groupQuotes[0]);
    const bestArbitrage: IBestArbitrageByGroup = bestArbitrageByGroup(groupQuotes);

    const amountInStep0 = BigInt(bestArbitrage.bestBuy?.pair.amount ?? '0');
    const amountOutStep0 = BigInt(bestArbitrage.bestBuy?.quote?.quoteExactInputSingle?.amountOut ?? '0');
    const amountInStep1 = BigInt(bestArbitrage.bestSell?.quote?.quoteExactOutputSingle?.amountIn ?? '0');

    const amountOutStep1 = calculateFinalAmountOut(
      amountInStep0,
      amountOutStep0,
      amountInStep1,
    );

    const diff = amountOutStep1 - amountInStep0;

    const spreadBpsBI = (diff * 10000n) / amountInStep0;
    const spread_bps = Number(spreadBpsBI);
    const spread_pct = spread_bps / 100;

    const groupHasArb = (spread_bps ?? 0) > 0;
    hasArbitrage = hasArbitrage || groupHasArb;

    if (testMode || groupHasArb) {
      groups.push({
        bestArbitrage,
        amountOutStep1,
        spread_bps,
        spread_pct
      });
    }
  }

  return {
    hasArbitrage,
    groups,
  };
}
