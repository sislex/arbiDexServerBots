import {IBotsRule, IBotType, IJobType, ITokenInfo} from '../state.types';
import {parseUnits} from 'ethers';
const USDC: ITokenInfo = { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 };
const USDT: ITokenInfo = { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 };

const WETH: ITokenInfo = { address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', decimals: 18 };
const ARB: ITokenInfo = { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18 };
const DAI: ITokenInfo = { address: '0x7CF803e8d82A50504180f417B8bC7a493C0a0503', decimals: 18 };
const WBTC: ITokenInfo = { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8 };
const UPD: ITokenInfo = { address: '0x329730DDa41c079e684A18C47800572aAFe2c1DF', decimals: 18 };
// const WISE: ITokenInfo = { address: '0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6', decimals: 18 };
const GMX: ITokenInfo = { address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', decimals: 18 };
const LINK: ITokenInfo = { address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', decimals: 18 };


export const BotRuleListStab: IBotsRule[] = [
  {
    id: 'botRule1',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 1000,
      maxJobs: 1000000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      // poolAddress: '0xC6962004f452bE9203591991D15f6b388e09E8D0', // лучше не передавать, чтобы работало быстрее из-за разогрева api
      tokenIn: WETH,
      tokenOut: GMX,
      amountIn: parseUnits("0.3", WETH.decimals).toString(),
      amountOut: parseUnits("0.3", WETH.decimals).toString(),
      feePpm: 10000,
    }
  },


  {
    id: 'botRule2',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 1000,
      maxJobs: 1000000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',

      pairsToQuote: [
        {
          tokenIn: USDC,
          tokenOut: WETH,
          amountIn: parseUnits("1000", USDC.decimals).toString(),
          amountOut: parseUnits("1000", USDC.decimals).toString(),
          feePpm: 500,
        },
        {
          tokenIn: USDC,
          tokenOut: ARB,
          amountIn: parseUnits("1000", USDC.decimals).toString(),
          amountOut: parseUnits("1000", USDC.decimals).toString(),
          feePpm: 500,
        },
        {
          tokenIn: USDC,
          tokenOut: USDT,
          amountIn: parseUnits("1000", USDC.decimals).toString(),
          amountOut: parseUnits("1000", USDC.decimals).toString(),
          feePpm: 500,
        },
        {
          tokenIn: USDC,
          tokenOut: WBTC,
          amountIn: parseUnits("1000", USDC.decimals).toString(),
          amountOut: parseUnits("1000", USDC.decimals).toString(),
          feePpm: 500,
        },

        {
          tokenIn: WETH,
          tokenOut: WBTC,
          amountIn: parseUnits("0.3", WETH.decimals).toString(),
          amountOut: parseUnits("0.3", WETH.decimals).toString(),
          feePpm: 3000,
        },
        {
          tokenIn: WETH,
          tokenOut: GMX,
          amountIn: parseUnits("0.3", WETH.decimals).toString(),
          amountOut: parseUnits("0.3", WETH.decimals).toString(),
          feePpm: 10000,
        },
        {
          tokenIn: WETH,
          tokenOut: LINK,
          amountIn: parseUnits("0.3", WETH.decimals).toString(),
          amountOut: parseUnits("0.3", WETH.decimals).toString(),
          feePpm: 3000,
        },
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
