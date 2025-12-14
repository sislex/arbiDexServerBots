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

export interface IPairsToQuoteParams {
  poolsSettings: IPoolsSettings;
  dex?: DexId;
  version?: PoolVersion;
  feePpmList?: number[];
}


function getPairsToQuote(params: IPairsToQuoteParams): IPairToQuote[] {
  const {
    version = 'v2',
  } = params;
  let pairList: IPairToQuote[] = [];
  if (version === 'v2') {
    pairList = getPairsToQuoteV2(params);
  } else if (version === 'v3') {
    pairList = getPairsToQuoteV3(params);
  }

  return pairList;
}

function getPairsToQuoteV2(params: IPairsToQuoteParams): IPairToQuote[] {
  const {
    poolsSettings,
    dex = 'uniswap',
    version = 'v2',
  } = params;
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

function getPairsToQuoteV3(params: IPairsToQuoteParams): IPairToQuote[] {
  const {
    poolsSettings,
    dex = 'uniswap',
    version = 'v3',
  } = params;
  const pairList: IPairToQuote[] = [];
  for (const amount of poolsSettings.amountList) {
    if (params.feePpmList) {
      for (const feePpm of params.feePpmList) {
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
  }
  return pairList;
}

export interface IPoolsSettings {
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amountList: string[];
}

const POOLS_USDC_WETH = {
  tokenIn: USDC,
  tokenOut: WETH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_WBTC = {
  tokenIn: USDC,
  tokenOut: WBTC,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_ARB = {
  tokenIn: USDC,
  tokenOut: ARB,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_TMX = {
  tokenIn: USDC,
  tokenOut: TMX,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_SECH = {
  tokenIn: USDC,
  tokenOut: SECH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_DAI = {
  tokenIn: USDC,
  tokenOut: DAI,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_YEP = {
  tokenIn: USDC,
  tokenOut: YEP,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_QODA = {
  tokenIn: USDC,
  tokenOut: QODA,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_OPUL = {
  tokenIn: USDC,
  tokenOut: OPUL,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};

const POOLS_USDC_FARE = {
  tokenIn: USDC,
  tokenOut: FARE,
  amountList: [parseUnits("100", USDC.decimals).toString()],
};


const POOLS_WETH_USDC = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_USDT = {
  tokenIn: WETH,
  tokenOut: USDT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_WBTC = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_ARB = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_DAI = {
  tokenIn: WETH,
  tokenOut: DAI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_GMX = {
  tokenIn: WETH,
  tokenOut: GMX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_LINK = {
  tokenIn: WETH,
  tokenOut: LINK,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_WISE = {
  tokenIn: WETH,
  tokenOut: WISE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_RAIN = {
  tokenIn: WETH,
  tokenOut: RAIN,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_USDCE = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_PENDLE = {
  tokenIn: WETH,
  tokenOut: PENDLE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_WSTETH = {
  tokenIn: WETH,
  tokenOut: WSTETH,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
};

const POOLS_WETH_USDPLUS = {
  tokenIn: WETH,
  tokenOut: USDPLUS,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
};

const POOLS_WETH_MOR = {
  tokenIn: WETH,
  tokenOut: MOR,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
};

const POOLS_WETH_CRYPTO = {
  tokenIn: WETH,
  tokenOut: CRYPTO,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
};



const pairsToQuoteV2UsdcWeth = getPairsToQuote({poolsSettings: POOLS_USDC_WETH, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcTmx = getPairsToQuote({poolsSettings: POOLS_USDC_TMX, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcSech = getPairsToQuote({poolsSettings: POOLS_USDC_SECH, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcWbtc = getPairsToQuote({poolsSettings: POOLS_USDC_WBTC, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcArb = getPairsToQuote({poolsSettings: POOLS_USDC_ARB, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcDai = getPairsToQuote({poolsSettings: POOLS_USDC_DAI, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcYep = getPairsToQuote({poolsSettings: POOLS_USDC_YEP, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcQoda = getPairsToQuote({poolsSettings: POOLS_USDC_QODA, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcOpul = getPairsToQuote({poolsSettings: POOLS_USDC_OPUL, dex: 'uniswap', version: 'v2'});
const pairsToQuoteV2UsdcFare = getPairsToQuote({poolsSettings: POOLS_USDC_FARE, dex: 'uniswap', version: 'v2'});

const pairsToQuoteV3WethUsdc = getPairsToQuote({poolsSettings: POOLS_WETH_USDC, dex: 'uniswap', version: 'v3', feePpmList: [100, 500, 3000, 10000],});
const pairsToQuoteV3WethUsdt = getPairsToQuote({poolsSettings: POOLS_WETH_USDT, dex: 'uniswap', version: 'v3', feePpmList: [100, 500, 3000, 10000]});
const pairsToQuoteV3WethWbtc = getPairsToQuote({poolsSettings: POOLS_WETH_WBTC, dex: 'uniswap', version: 'v3', feePpmList: [100, 500, 3000, 10000]});
const pairsToQuoteV3WethArb = getPairsToQuote({poolsSettings: POOLS_WETH_ARB, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsToQuoteV3WethDai = getPairsToQuote({poolsSettings: POOLS_WETH_DAI, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsToQuoteV3WethGmx = getPairsToQuote({poolsSettings: POOLS_WETH_GMX, dex: 'uniswap', version: 'v3', feePpmList: [3000, 10000]});
const pairsToQuoteV3WethLink = getPairsToQuote({poolsSettings: POOLS_WETH_LINK, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000]});
const pairsToQuoteV3WethRain = getPairsToQuote({poolsSettings: POOLS_WETH_RAIN, dex: 'uniswap', version: 'v3', feePpmList: [100, 10000]});
const pairsToQuoteV3WethUsdce = getPairsToQuote({poolsSettings: POOLS_WETH_USDCE, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000]});
const pairsToQuoteV3WethPendle = getPairsToQuote({poolsSettings: POOLS_WETH_PENDLE, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsToQuoteV3WethWstest = getPairsToQuote({poolsSettings: POOLS_WETH_WSTETH, dex: 'uniswap', version: 'v3', feePpmList: [100, 3000]});
const pairsToQuoteV3WethUsdplus = getPairsToQuote({poolsSettings: POOLS_WETH_USDPLUS, dex: 'uniswap', version: 'v3', feePpmList: [500]});
const pairsToQuoteV3WethMor = getPairsToQuote({poolsSettings: POOLS_WETH_MOR, dex: 'uniswap', version: 'v3', feePpmList: [3000, 10000]});
const pairsToQuoteV3WethCrypto = getPairsToQuote({poolsSettings: POOLS_WETH_CRYPTO, dex: 'uniswap', version: 'v3', feePpmList: [10000]});

const pairsToQuoteV3UsdcWeth = getPairsToQuote({poolsSettings: POOLS_USDC_WETH, dex: 'uniswap', version: 'v3',   feePpmList: [100, 500, 3000, 10000]});
const pairsToQuoteV3UsdcWbtc = getPairsToQuote({poolsSettings: POOLS_USDC_WBTC, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsToQuoteV3UsdcArb = getPairsToQuote({poolsSettings: POOLS_USDC_ARB, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000]});




const pairsToQuoteBot1: IPairToQuote[] = [
  ...pairsToQuoteV3WethUsdc,
  ...pairsToQuoteV3WethUsdt,
  ...pairsToQuoteV3WethWbtc,
  ...pairsToQuoteV3WethArb,
  ...pairsToQuoteV3WethDai,
  ...pairsToQuoteV3WethGmx,
  ...pairsToQuoteV3WethLink,
  ...pairsToQuoteV3WethRain,
  ...pairsToQuoteV3WethUsdce,
  ...pairsToQuoteV3WethPendle,
  ...pairsToQuoteV3WethWstest,
  ...pairsToQuoteV3WethUsdplus,
  ...pairsToQuoteV3WethMor,
  ...pairsToQuoteV3WethCrypto,


  ...pairsToQuoteV3UsdcWeth,
  ...pairsToQuoteV3UsdcWbtc,
  ...pairsToQuoteV3UsdcArb,

  ...pairsToQuoteV2UsdcWeth,
  ...pairsToQuoteV2UsdcTmx,
  ...pairsToQuoteV2UsdcSech,
  ...pairsToQuoteV2UsdcWbtc,
  ...pairsToQuoteV2UsdcArb,
  ...pairsToQuoteV2UsdcDai,
  ...pairsToQuoteV2UsdcYep,
  ...pairsToQuoteV2UsdcQoda,
  ...pairsToQuoteV2UsdcOpul,
  ...pairsToQuoteV2UsdcFare,




];
const pairsToQuoteBot2: IPairToQuote[] = [
  ...pairsToQuoteV3WethCrypto,
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
      delayBetweenRepeat: 3000,
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
