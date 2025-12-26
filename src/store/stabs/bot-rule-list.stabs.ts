import {
  IBotsRule,
  IBotType,
  IJobType, IQuote
} from '../state.types';
import {quotesSushiUsdcOut, quotesSushiWethOut} from './sushi/v3/quotesSushiV3.stabs';
import {quotesSushiV2WethOut} from './sushi/v2/quotesSushiV2.stabs';
import {quotesUsdcOut, quotesWethOut} from './uniswap/v3/quotesUniswapV3.stabs';

export function filterDirectionsWithDuplicates(items: IQuote[]): IQuote[] {
  const counts = new Map<string, number>();

  // 1) считаем сколько раз встречается каждое направление
  for (const item of items) {
    const key =
      `${item.tokenIn.address.toLowerCase()}->${item.tokenOut.address.toLowerCase()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // 2) оставляем только те, где count >= 2
  return items.filter(item => {
    const key =
      `${item.tokenIn.address.toLowerCase()}->${item.tokenOut.address.toLowerCase()}`;
    return (counts.get(key) ?? 0) >= 2;
  });
}

const quotes = [
  ...quotesWethOut,
  // ...quotesUsdcOut,

  ...quotesSushiV2WethOut,

  ...quotesSushiWethOut,
  // ...quotesSushiUsdcOut,

];

// фильтруем только направления, где есть дубликаты (хотя бы 2 котировки на одно направление)
const filteredQuotes = filterDirectionsWithDuplicates(quotes);

console.log(filteredQuotes.length);

export const BotRuleListStab: IBotsRule[] = [
  {
    id: 'botRule2',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 10,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_QUOTES_MULTI,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',

      pairsToQuote: filteredQuotes,

    }
  },

];
