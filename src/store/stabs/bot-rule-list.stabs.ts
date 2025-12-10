import {DexId, IBotsRule, IBotType, IJobType, IPairToQuote, ITokenInfo, PoolVersion} from '../state.types';
import {parseUnits} from 'ethers';


function getPairsToQuote(poolsSettings: IPoolsSettings, dex: DexId = 'uniswap', version: PoolVersion = 'v3'): IPairToQuote[] {
  let pairList: IPairToQuote[] = [];
  if (version === 'v2') {
    pairList = getPairsToQuoteV2(poolsSettings, dex, version);
  } else if (version === 'v3') {
    pairList = getPairsToQuoteV3(poolsSettings, dex, version);
  }

  return pairList;
}

function getPairsToQuoteV2(poolsSettings: IPoolsSettings, dex: DexId = 'uniswap', version: PoolVersion = 'v2'): IPairToQuote[] {
  const pairList: IPairToQuote[] = [];
  for (const amount of poolsSettings.amountList) {
    pairList.push({
      dex,
      version,
      tokenIn: poolsSettings.tokenIn,
      tokenOut: poolsSettings.tokenOut,
      amountIn: amount,
      amountOut: amount,
      feePpm: 3000, // не используется в v2
      path: [poolsSettings.tokenIn, poolsSettings.tokenOut,]
    });
  }
  return pairList;
}

function getPairsToQuoteV3(poolsSettings: IPoolsSettings, dex: DexId = 'uniswap', version: PoolVersion = 'v3'): IPairToQuote[] {
  const pairList: IPairToQuote[] = [];
  for (const amount of poolsSettings.amountList) {
    for (const feePpm of poolsSettings.feePpmList) {
      pairList.push({
        dex,
        version,
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
const TMX: ITokenInfo = { address: '0xa057Bf62b7760ae11d782DaB5e081728BCDA7017', decimals: 18 };
const SECH: ITokenInfo = { address: '0x87B40e0cc30755Ecb93Ac1EB07a3636C9fA18149', decimals: 18 };
const YEP: ITokenInfo = { address: '0xB350BF8C544f82013c2991C3265e386700024131', decimals: 18 };
const QODA: ITokenInfo = { address: '0x763a716dD74a79d037E57f993fe3047271879bc1', decimals: 18 };
const OPUL: ITokenInfo = { address: '0x0c5fa0E07949F941A6c2C29a008252db1527d6EE', decimals: 18 };
const FARE: ITokenInfo = { address: '0xFA4E888d9fBBcF4AfA7BF057ECfe59Ed04619e62', decimals: 18 };

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
    500,
    3000,
    10000
  ],
};

const POOLS_USDC_WBTC = {
  tokenIn: USDC,
  tokenOut: WBTC,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [500, 3000, 10000],
};

const POOLS_USDC_ARB = {
  tokenIn: USDC,
  tokenOut: ARB,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [500, 3000],
};

const POOLS_USDC_TMX = {
  tokenIn: USDC,
  tokenOut: TMX,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};

const POOLS_USDC_SECH = {
  tokenIn: USDC,
  tokenOut: SECH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};

const POOLS_USDC_DAI = {
  tokenIn: USDC,
  tokenOut: DAI,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};

const POOLS_USDC_YEP = {
  tokenIn: USDC,
  tokenOut: YEP,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};

const POOLS_USDC_QODA = {
  tokenIn: USDC,
  tokenOut: QODA,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};

const POOLS_USDC_OPUL = {
  tokenIn: USDC,
  tokenOut: OPUL,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};

const POOLS_USDC_FARE = {
  tokenIn: USDC,
  tokenOut: FARE,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpmList: [],
};


const POOLS_WETH_USDC = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [100, 500, 3000, 10000],
};

const POOLS_WETH_USDT = {
  tokenIn: WETH,
  tokenOut: USDT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [100, 500, 3000, 10000],
};

const POOLS_WETH_WBTC = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [100, 500, 3000, 10000],
};

const POOLS_WETH_ARB = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [500, 3000, 10000],
};

const POOLS_WETH_DAI = {
  tokenIn: WETH,
  tokenOut: DAI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [
    500,
    3000,
    10000
  ],
};

const POOLS_WETH_GMX = {
  tokenIn: WETH,
  tokenOut: GMX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [3000, 10000],
};

const POOLS_WETH_LINK = {
  tokenIn: WETH,
  tokenOut: LINK,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
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

const pairsToQuoteUsdcWethV2 = getPairsToQuote(POOLS_USDC_WETH, 'uniswap', 'v2');
const pairsToQuoteUsdcTmxV2 = getPairsToQuote(POOLS_USDC_TMX, 'uniswap', 'v2');
const pairsToQuoteUsdcSechV2 = getPairsToQuote(POOLS_USDC_SECH, 'uniswap', 'v2');
const pairsToQuoteUsdcWbtcV2 = getPairsToQuote(POOLS_USDC_WBTC, 'uniswap', 'v2');
const pairsToQuoteUsdcArbV2 = getPairsToQuote(POOLS_USDC_ARB, 'uniswap', 'v2');
const pairsToQuoteUsdcDaiV2 = getPairsToQuote(POOLS_USDC_DAI, 'uniswap', 'v2');
const pairsToQuoteUsdcYepV2 = getPairsToQuote(POOLS_USDC_YEP, 'uniswap', 'v2');
const pairsToQuoteUsdcQodaV2 = getPairsToQuote(POOLS_USDC_QODA, 'uniswap', 'v2');
const pairsToQuoteUsdcOpulV2 = getPairsToQuote(POOLS_USDC_OPUL, 'uniswap', 'v2');
const pairsToQuoteUsdcFareV2 = getPairsToQuote(POOLS_USDC_FARE, 'uniswap', 'v2');


const pairsToQuoteBot1: IPairToQuote[] = [
  ...pairsToQuoteUsdcWethV2,
  ...pairsToQuoteUsdcTmxV2,
  ...pairsToQuoteUsdcSechV2,
  ...pairsToQuoteUsdcWbtcV2,
  ...pairsToQuoteUsdcArbV2,
  ...pairsToQuoteUsdcDaiV2,
  ...pairsToQuoteUsdcYepV2,
  ...pairsToQuoteUsdcQodaV2,
  ...pairsToQuoteUsdcOpulV2,


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
const pairsToQuoteBot2: IPairToQuote[] = [
  ...pairsToQuoteUsdcFareV2,
];



console.log('pairsToQuote count:', pairsToQuoteBot1.length);
// console.log(pairsToQuoteBot2);


export const BotRuleListStab: IBotsRule[] = [
  {
    id: 'botRule1',
    botParams: {
      botType: IBotType.TEST_BOT,
      paused: false,
      isRepeat: true,
      delayBetweenRepeat: 100,
      maxJobs: 1000000,
      maxErrors: 100,
      timeoutMs: 1000,
    },
    jobParams: {
      jobType: IJobType.GET_ARBITRUM_QUOTES_MULTI,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',

      pairsToQuote: pairsToQuoteBot1,

    }
  },
  // {
  //   id: 'botRule2',
  //   botParams: {
  //     botType: IBotType.TEST_BOT,
  //     paused: false,
  //     isRepeat: true,
  //     delayBetweenRepeat: 100,
  //     maxJobs: 1000000,
  //     maxErrors: 100,
  //     timeoutMs: 1000,
  //   },
  //   jobParams: {
  //     jobType: IJobType.GET_ARBITRUM_UNISWAP_V2_QUOTES,
  //     rpcUrl: 'https://arb1.arbitrum.io/rpc',
  //
  //     pairsToQuote: pairsToQuoteBot2,
  //
  //   }
  // },

];
