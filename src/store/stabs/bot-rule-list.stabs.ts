import {DexId, IBotsRule, IBotType, IJobType, IPairToQuote, ITokenInfo, PoolVersion} from '../state.types';
import {parseUnits} from 'ethers';
import {
  ARB, CRYPTO,
  DAI,
  FARE,
  GMX,
  LINK, MOR,
  OPUL, PENDLE,
  QODA,
  RAIN,
  SECH,
  TMX,
  USDC, USDCE, USDPLUS,
  USDT,
  WBTC,
  WETH,
  WISE, WSTETH,
  YEP
} from './tokens.stabs';


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

const POOLS_WETH_WISE = {
  tokenIn: WETH,
  tokenOut: WISE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [],
};

const POOLS_WETH_RAIN = {
  tokenIn: WETH,
  tokenOut: RAIN,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [
    100,
    10000,
  ],
};

const POOLS_WETH_USDCE = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [
    500,
    3000,
  ],
};

const POOLS_WETH_PENDLE = {
  tokenIn: WETH,
  tokenOut: PENDLE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [
    500,
    3000,
    10000,
  ],
};

const POOLS_WETH_WSTETH = {
  tokenIn: WETH,
  tokenOut: WSTETH,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpmList: [
    100,
    3000,
  ],
};

const POOLS_WETH_USDPLUS = {
  tokenIn: WETH,
  tokenOut: USDPLUS,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
  feePpmList: [
    500,
  ],
};

const POOLS_WETH_MOR = {
  tokenIn: WETH,
  tokenOut: MOR,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
  feePpmList: [
    3000,
    10000,
  ],
};

const POOLS_WETH_CRYPTO = {
  tokenIn: WETH,
  tokenOut: CRYPTO,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
  feePpmList: [
    10000,
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
const pairsToQuoteWethRain = getPairsToQuote(POOLS_WETH_RAIN);
const pairsToQuoteWethUsdce = getPairsToQuote(POOLS_WETH_USDCE);
const pairsToQuoteWethPendle = getPairsToQuote(POOLS_WETH_PENDLE);
const pairsToQuoteWethWstest = getPairsToQuote(POOLS_WETH_WSTETH);
const pairsToQuoteWethUsdplus = getPairsToQuote(POOLS_WETH_USDPLUS);
const pairsToQuoteWethMor = getPairsToQuote(POOLS_WETH_MOR);
const pairsToQuoteWethCrypto = getPairsToQuote(POOLS_WETH_CRYPTO);



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

// const pairsToQuoteWethWiseV2 = getPairsToQuote(POOLS_WETH_WISE, 'uniswap', 'v2');


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
  ...pairsToQuoteUsdcFareV2,



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
  ...pairsToQuoteWethRain,
  ...pairsToQuoteWethUsdce,
  ...pairsToQuoteWethPendle,
  ...pairsToQuoteWethWstest,
  ...pairsToQuoteWethUsdplus,
  ...pairsToQuoteWethMor,
];
const pairsToQuoteBot2: IPairToQuote[] = [
  ...pairsToQuoteWethCrypto,
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
