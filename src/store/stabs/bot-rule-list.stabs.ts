import {
  IBotsRule,
  IBotType,
  IJobType,
} from '../state.types';
import {quotesSushiUsdcOut, quotesSushiWethOut} from './sushi/v3/quotesSushiV3.stabs';
import {quotesSushiV2WethOut} from './sushi/v2/quotesSushiV2.stabs';
import {quotesUsdcOut, quotesWethOut} from './uniswap/v3/quotesUniswapV3.stabs';

export const BotRuleListStab: IBotsRule[] = [
  {
    id: 'botRule2',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 100000,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_QUOTES_MULTI,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',

      pairsToQuote: [
        ...quotesWethOut,
        ...quotesUsdcOut,

        ...quotesSushiV2WethOut,

        ...quotesSushiWethOut,
        ...quotesSushiUsdcOut,
      ],

    }
  },

];
