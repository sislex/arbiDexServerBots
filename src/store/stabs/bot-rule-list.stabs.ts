import {IBotsRule, IBotType, IJobType, IPairToQuote, ITokenInfo} from '../state.types';
import {parseUnits} from 'ethers';


function getPairsToQuote(poolsSettings: IPoolsSettings): IPairToQuote[] {
  const pairList: IPairToQuote[] = [];
  for (const amount of poolsSettings.amountList) {
    for (const feePpm of poolsSettings.feePpmList) {
      pairList.push({
        tokenIn: poolsSettings.tokenIn,
        tokenOut: poolsSettings.tokenOut,
        amountIn: amount,
        amountOut: amount,
        feePpm: feePpm,
      });
    }
  }
  return pairList;
}

const USDC: ITokenInfo = { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 };
const USDT: ITokenInfo = { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 };

const WETH: ITokenInfo = { address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', decimals: 18 };
const WBTC: ITokenInfo = { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8 };

const ARB: ITokenInfo = { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18 };
const DAI: ITokenInfo = { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 };
const GMX: ITokenInfo = { address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', decimals: 18 };
const LINK: ITokenInfo = { address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', decimals: 18 };

// напиши интерфейс для POOLS_USDC_WETH
export interface IPoolsSettings {
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amountList: string[];
  feePpmList: number[];
}

const POOLS_USDC_WETH = {
  tokenIn: USDC,
  tokenOut: WETH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [
    100,
    // 500,
    // 3000,
    // 10000
  ],
};

const POOLS_USDC_WBTC = {
  tokenIn: USDC,
  tokenOut: WBTC,
  amountList: [parseUnits("1000", USDC.decimals).toString()],
  feePpmList: [500, 3000, 10000],
};

const POOLS_USDC_ARB = {
  tokenIn: USDC,
  tokenOut: ARB,
  amountList: [parseUnits("1000", USDC.decimals).toString()],
  feePpmList: [500, 3000],
};

const POOLS_WETH_USDC = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [100, 500, 3000, 10000],
};

const POOLS_WETH_USDT = {
  tokenIn: WETH,
  tokenOut: USDT,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [100, 500, 3000, 10000],
};

const POOLS_WETH_WBTC = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [100, 500, 3000, 10000],
};

const POOLS_WETH_ARB = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [500, 3000, 10000],
};

const POOLS_WETH_DAI = {
  tokenIn: WETH,
  tokenOut: DAI,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [
    500,
    3000,
    10000
  ],
};

const POOLS_WETH_GMX = {
  tokenIn: WETH,
  tokenOut: GMX,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [3000, 10000],
};

const POOLS_WETH_LINK = {
  tokenIn: WETH,
  tokenOut: LINK,
  amountList: [parseUnits("0.3", WETH.decimals).toString()],
  feePpmList: [
    500,
    3000,
  ],
};



const pairsToQuoteUsdcWeth = getPairsToQuote(POOLS_USDC_WETH);
const pairsToQuoteUsdcWbtc = getPairsToQuote(POOLS_USDC_WBTC);
const pairsToQuoteUsdcArb = getPairsToQuote(POOLS_USDC_ARB);

const pairsToQuoteWethUsdc = getPairsToQuote(POOLS_WETH_USDC);
const pairsToQuoteWethUsdt = getPairsToQuote(POOLS_WETH_USDT);
const pairsToQuoteWethWbtc = getPairsToQuote(POOLS_WETH_WBTC);
const pairsToQuoteWethArb = getPairsToQuote(POOLS_WETH_ARB);
const pairsToQuoteWethDai = getPairsToQuote(POOLS_WETH_DAI);
const pairsToQuoteWethGmx = getPairsToQuote(POOLS_WETH_GMX);
const pairsToQuoteWethLink = getPairsToQuote(POOLS_WETH_LINK);


const pairsToQuote: IPairToQuote[] = [
  ...pairsToQuoteUsdcWeth,
  ...pairsToQuoteUsdcWbtc,
  ...pairsToQuoteUsdcArb,

  ...pairsToQuoteWethUsdc,
  ...pairsToQuoteWethUsdt,
  ...pairsToQuoteWethWbtc,
  ...pairsToQuoteWethArb,
  ...pairsToQuoteWethDai,
  ...pairsToQuoteWethGmx,
  ...pairsToQuoteWethLink,
];
console.log('pairsToQuote count:', pairsToQuote.length);
console.log(pairsToQuote);


export const BotRuleListStab: IBotsRule[] = [
  // {
  //   id: 'botRule1',
  //   botParams: {
  //     botType: IBotType.TEST_BOT,
  //     paused: false,
  //     isRepeat: true,
  //     delayBetweenRepeat: 1000,
  //     maxJobs: 1000000,
  //   },
  //   jobParams: {
  //     jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES,
  //     rpcUrl: 'https://arb1.arbitrum.io/rpc',
  //     // poolAddress: '0xC6962004f452bE9203591991D15f6b388e09E8D0', // лучше не передавать, чтобы работало быстрее из-за разогрева api
  //     tokenIn: WETH,
  //     tokenOut: DAI,
  //     amountIn: parseUnits("0.3", WETH.decimals).toString(),
  //     amountOut: parseUnits("0.3", WETH.decimals).toString(),
  //     feePpm: 3000,
  //   }
  // },


  // {
  //   id: 'botRule2',
  //   botParams: {
  //     botType: IBotType.TEST_BOT,
  //     paused: false,
  //     isRepeat: true,
  //     delayBetweenRepeat: 1000,
  //     maxJobs: 1000000,
  //   },
  //   jobParams: {
  //     jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI,
  //     rpcUrl: 'https://arb1.arbitrum.io/rpc',
  //
  //     pairsToQuote: [
  //       {
  //         tokenIn: USDC,
  //         tokenOut: WETH,
  //         amountIn: parseUnits("1000", USDC.decimals).toString(),
  //         amountOut: parseUnits("1000", USDC.decimals).toString(),
  //         feePpm: 500,
  //       },
  //       {
  //         tokenIn: USDC,
  //         tokenOut: ARB,
  //         amountIn: parseUnits("1000", USDC.decimals).toString(),
  //         amountOut: parseUnits("1000", USDC.decimals).toString(),
  //         feePpm: 500,
  //       },
  //       {
  //         tokenIn: USDC,
  //         tokenOut: USDT,
  //         amountIn: parseUnits("1000", USDC.decimals).toString(),
  //         amountOut: parseUnits("1000", USDC.decimals).toString(),
  //         feePpm: 500,
  //       },
  //       {
  //         tokenIn: USDC,
  //         tokenOut: WBTC,
  //         amountIn: parseUnits("1000", USDC.decimals).toString(),
  //         amountOut: parseUnits("1000", USDC.decimals).toString(),
  //         feePpm: 500,
  //       },
  //
  //       {
  //         tokenIn: WETH,
  //         tokenOut: WBTC,
  //         amountIn: parseUnits("0.3", WETH.decimals).toString(),
  //         amountOut: parseUnits("0.3", WETH.decimals).toString(),
  //         feePpm: 3000,
  //       },
  //       {
  //         tokenIn: WETH,
  //         tokenOut: GMX,
  //         amountIn: parseUnits("0.3", WETH.decimals).toString(),
  //         amountOut: parseUnits("0.3", WETH.decimals).toString(),
  //         feePpm: 10000,
  //       },
  //       {
  //         tokenIn: WETH,
  //         tokenOut: LINK,
  //         amountIn: parseUnits("0.3", WETH.decimals).toString(),
  //         amountOut: parseUnits("0.3", WETH.decimals).toString(),
  //         feePpm: 3000,
  //       },
  //     ],
  //
  //   }
  // },



  // {
  //   id: 'botRule4',
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

  {
    id: 'botRuleRpc',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 100,
      maxJobs: 1000000,
      maxErrors: 1000,
      timeoutMs: 500,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',

      pairsToQuote: pairsToQuote,

    }
  },
];
