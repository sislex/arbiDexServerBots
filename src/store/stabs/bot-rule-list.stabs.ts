import {IBotsRule, IBotType, IJobType} from '../state.types';
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const ARB = '0x912CE59144191C1204E64559FE8253a0e49E6548';
const DAI = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
const USDT = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9';
const WBTC = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f';

export const BotRuleListStab: IBotsRule[] = [
  {
    id: 'botRule1',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 500,
      maxJobs: 1000000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      // poolAddress: '0xC6962004f452bE9203591991D15f6b388e09E8D0', // лучше не передавать, чтобы работало быстрее из-за разогрева api
      tokenIn: { address: USDC, decimals: 6 },
      tokenOut: { address: WETH, decimals: 18 },
      amountIn: 1000n * 1_000_000n,
      amountOut: 1000n * 1_000_000n,
      feePpm: 500,
    }
  },
  {
    id: 'botRule2',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 500,
      maxJobs: 1000000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',

      pairsToQuote: [
        {
          tokenIn: { address: USDC, decimals: 6 },
          tokenOut: { address: WETH, decimals: 18 },
          amountIn: 1000n * 1_000_000n,
          amountOut: 1000n * 1_000_000n,
          feePpm: 500,
        },
        // {
        //   tokenIn: { address: USDC, decimals: 6 },
        //   tokenOut: { address: ARB, decimals: 18 },
        //   amountIn: 1000n * 1_000_000n,
        //   amountOut: 1000n * 1_000_000n,
        //   feePpm: 500,
        // },
        // {
        //   tokenIn: { address: USDC, decimals: 6 },
        //   tokenOut: { address: USDT, decimals: 6 },
        //   amountIn: 1000n * 1_000_000n,
        //   amountOut: 1000n * 1_000_000n,
        //   feePpm: 500,
        // },
        // {
        //   tokenIn: { address: USDC, decimals: 6 },
        //   tokenOut: { address: WBTC, decimals: 18 },
        //   amountIn: 1000n * 1_000_000n,
        //   amountOut: 1000n * 1_000_000n,
        //   feePpm: 500,
        // },

        // {
        //   tokenIn: { address: USDC, decimals: 6 },
        //   tokenOut: { address: DAI, decimals: 18 },
        //   amountIn: 1000n * 1_000_000n,
        //   amountOut: 1000n * 1_000_000n,
        //   feePpm: 500,
        // },
      ],

    }
  },
  // {
  //   id: 'botRule3',
  //   botParams: {
  //     botType: IBotType.TEST_BOT,
  //     paused: false,
  //     isRepeat: true,
  //     delayBetweenRepeat: 1000,
  //     maxJobs: 1000000,
  //   },
  //   jobParams: {
  //     jobType: IJobType.GET_POOL_STATE,
  //     rpcUrl: 'https://arb1.arbitrum.io/rpc',
  //     poolAddress: '0xC6962004f452bE9203591991D15f6b388e09E8D0',
  //     wordsAround: 3, // шире окно
  //     maxTicks: 300, // лимит тиков
  //   }
  // },
];
