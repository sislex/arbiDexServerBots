import {DexId, IBotsRule, IBotType, IJobType, IPairToQuote, ITokenInfo, PoolVersion} from '../state.types';
import {parseUnits} from 'ethers';
import {
  $SHARBI,
  ADOGE,
  ARB, ARBY, ARVAULT, CRYPTO,
  DAI, DONUT, DPX, EMAX,
  FARE, FLUID, FLUX,
  GMX, GOHM, GOVI, HASH, HWT, JETH,
  LINK, LIQD, MAGIC, MIM, MOR, OMNI,
  OPUL, PENDLE, PEPE,
  QODA,
  RAIN,
  SECH, SNSY, SPELL, SUSHI,
  TMX,
  USDC, USDCE, USDPLUS,
  USDT,
  WBTC,
  WETH,
  WISE, WSTETH,
  YEP, ZRO
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
    pairList = getpairsV2Uniswap(params);
  } else if (version === 'v3') {
    pairList = getpairsV3Uniswap(params);
  }

  return pairList;
}

function getpairsV2Uniswap(params: IPairsToQuoteParams): IPairToQuote[] {
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

function getpairsV3Uniswap(params: IPairsToQuoteParams): IPairToQuote[] {
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
          poolAddress: poolsSettings.poolAddress,
        });
      }
    }
  }
  return pairList;
}

function getpairsV3UniswapByPoolAddress(params: IPairsToQuoteParams): IPairToQuote[] {
  const {
    poolsSettings,
    dex = 'uniswap',
    version = 'v3',
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
      feePpm: poolsSettings.feePpm,
      poolAddress: poolsSettings.poolAddress,
    });
  }
  return pairList;
}

export interface IPoolsSettings {
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amountList: string[];
  poolAddress?: string;
  feePpm: number;
}

const POOLS_UNISWAP_USDC_WETH: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: WETH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_WBTC: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: WBTC,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_ARB: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: ARB,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_TMX: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: TMX,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_SECH: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: SECH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_DAI : IPoolsSettings= {
  tokenIn: USDC,
  tokenOut: DAI,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_YEP: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: YEP,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_QODA: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: QODA,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_OPUL: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: OPUL,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_FARE: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: FARE,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};


const POOLS_UNISWAP_WETH_USDC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_USDT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_WBTC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_ARB: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_DAI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: DAI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_GMX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: GMX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_LINK: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: LINK,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_WISE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WISE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_RAIN: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: RAIN,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_USDCE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_PENDLE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: PENDLE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_WSTETH: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WSTETH,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_USDPLUS: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDPLUS,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_MOR: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: MOR,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_WETH_CRYPTO: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: CRYPTO,
  amountList: [parseUnits("0.003", WETH.decimals).toString()],
  feePpm: 0,
};

const POOLS_UNISWAP_USDC_WETH_test: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: WETH,
  amountList: [parseUnits("100", USDC.decimals).toString()],
  feePpm: 0,
};

const POOLS_SUSHI_USDC_WETH_500: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: WETH,
  amountList: [parseUnits("10", USDC.decimals).toString()],
  feePpm: 500,
  poolAddress: '0xf3eb87c1f6020982173c908e7eb31aa66c1f0296',
};

const POOLS_SUSHI_USDC_WETH_100: IPoolsSettings = {
  tokenIn: USDC,
  tokenOut: WETH,
  amountList: [parseUnits("10", USDC.decimals).toString()],
  feePpm: 100,
  poolAddress: '0xb658ee5c63922d2852f24458effa2bfa2cba3574',
};


const POOLS_SUSHI_WETH_USDC_500: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 500,
  poolAddress: '0xf3eb87c1f6020982173c908e7eb31aa66c1f0296',
};

const POOLS_SUSHI_WETH_USDC_100: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 100,
  poolAddress: '0xb658ee5c63922d2852f24458effa2bfa2cba3574',
};

const POOLS_SUSHI_WETH_DONUT_10000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: DONUT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 10000,
  poolAddress: '0x65f7a98d87bc21a3748545047632fef4d3ff9a67',
};

const POOLS_SUSHI_WETH_WSTETH_100: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WSTETH,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 100,
  poolAddress: '0x8bd39fa8608fd949c253987767540c26a0d974cf',
};

const POOLS_SUSHI_WETH_GOVI_3000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: GOVI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
  poolAddress: '0x581f84f5017f275dd5f6f4c045a66b7439331da0',
};

const POOLS_SUSHI_WETH_SNSY_10000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: SNSY,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 10000,
  poolAddress: '0x8d11274ddeb8b141a24ca8a36c63699214e0d221',
};

const POOLS_SUSHI_WETH_ARB_3000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
  poolAddress: '0xb3942c9ffa04efbc1fa746e146be7565c76e3dc1',
};

const POOLS_SUSHI_WETH_ARB_500: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 500,
  poolAddress: '0x99543bf98ca1830aa20d3eb12c1b9962f8eadc11',
};

const POOLS_SUSHI_WETH_USDCE_500: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 500,
  poolAddress: '0x15e444da5b343c5a0931f5d3e85d158d1efc3d40',
};

const POOLS_SUSHI_WETH_USDCE_3000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
  poolAddress: '0x4d1576158518dd61924218446c1057cf03138d57',
};

const POOLS_SUSHI_WETH_WBTC_3000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
  poolAddress: '0x6f10667f314498649eb2f80da244e8c6e9f031d5',
};

const POOLS_SUSHI_WETH_ZRO_3000: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ZRO,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
  poolAddress: '0x1797538dd80c041cc2f0c5901d5700868186a9a8',
};

const POOLS_SUSHI_WETH_HASH: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: HASH,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_USDCE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_MAGIC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: MAGIC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_DPX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: DPX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ARVAULT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARVAULT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_SPELL: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: SPELL,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ARBY: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARBY,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_USDT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_WBTC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ADOGE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ADOGE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_LIQD: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: LIQD,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_MIM: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: MIM,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_FLUID: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: FLUID,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_EMAX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: EMAX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_USDC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_JETH: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: JETH,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_SUSHI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: SUSHI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_PEPE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: PEPE,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_FLUX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: FLUX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_OMNI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: OMNI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_HWT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: HWT,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_GOHM: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: GOHM,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_$SHARBI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: $SHARBI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_LINK: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: LINK,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ARB: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_DAI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: DAI,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_GMX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: GMX,
  amountList: [parseUnits("0.03", WETH.decimals).toString()],
  feePpm: 3000,
};



const pairsV2UniswapUsdcWeth = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_WETH, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcTmx = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_TMX, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcSech = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_SECH, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcWbtc = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_WBTC, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcArb = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_ARB, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcDai = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_DAI, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcYep = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_YEP, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcQoda = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_QODA, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcOpul = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_OPUL, dex: 'uniswap', version: 'v2'});
const pairsV2UniswapUsdcFare = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_FARE, dex: 'uniswap', version: 'v2'});

const pairsV3UniswapWethUsdc = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_USDC, dex: 'uniswap', version: 'v3', feePpmList: [100, 500, 3000, 10000],});
const pairsV3UniswapWethUsdt = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_USDT, dex: 'uniswap', version: 'v3', feePpmList: [100, 500, 3000, 10000]});
const pairsV3UniswapWethWbtc = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_WBTC, dex: 'uniswap', version: 'v3', feePpmList: [100, 500, 3000, 10000]});
const pairsV3UniswapWethArb = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_ARB, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsV3UniswapWethDai = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_DAI, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsV3UniswapWethGmx = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_GMX, dex: 'uniswap', version: 'v3', feePpmList: [3000, 10000]});
const pairsV3UniswapWethLink = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_LINK, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000]});
const pairsV3UniswapWethRain = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_RAIN, dex: 'uniswap', version: 'v3', feePpmList: [100, 10000]});
const pairsV3UniswapWethUsdce = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_USDCE, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000]});
const pairsV3UniswapWethPendle = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_PENDLE, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsV3UniswapWethWstest = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_WSTETH, dex: 'uniswap', version: 'v3', feePpmList: [100, 3000]});
const pairsV3UniswapWethUsdplus = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_USDPLUS, dex: 'uniswap', version: 'v3', feePpmList: [500]});
const pairsV3UniswapWethMor = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_MOR, dex: 'uniswap', version: 'v3', feePpmList: [3000, 10000]});
const pairsV3UniswapWethCrypto = getPairsToQuote({poolsSettings: POOLS_UNISWAP_WETH_CRYPTO, dex: 'uniswap', version: 'v3', feePpmList: [10000]});

const pairsV3UniswapUsdcWeth = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_WETH, dex: 'uniswap', version: 'v3',   feePpmList: [100, 500, 3000, 10000]});
const pairsV3UniswapUsdcWbtc = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_WBTC, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000, 10000]});
const pairsV3UniswapUsdcArb = getPairsToQuote({poolsSettings: POOLS_UNISWAP_USDC_ARB, dex: 'uniswap', version: 'v3', feePpmList: [500, 3000]});



const pairsV2SushiWethHash = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_HASH, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethUsdce = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_USDCE, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethMagic = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_MAGIC, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethDpx = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_DPX, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethArvault = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_ARVAULT, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethSpell = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_SPELL, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethArby = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_ARBY, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethUsdt = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_USDT, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethWbtc = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_WBTC, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethAdoge = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_ADOGE, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethLiqd = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_LIQD, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethMim = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_MIM, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethFluid = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_FLUID, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethEmax = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_EMAX, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethUsdc = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_USDC, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethJeth = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_JETH, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethSushi = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_SUSHI, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethPepe = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_PEPE, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethFlux = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_FLUX, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethOmni = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_OMNI, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethHwt = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_HWT, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethGohm = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_GOHM, dex: 'sushi', version: 'v2'});
const pairsV2SushiWeth$sharbi = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_$SHARBI, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethLink = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_LINK, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethArb = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_ARB, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethDai = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_DAI, dex: 'sushi', version: 'v2'});
const pairsV2SushiWethGmx = getPairsToQuote({poolsSettings: POOLS_SUSHI_WETH_GMX, dex: 'sushi', version: 'v2'});


const pairsV3SushiUsdcWeth500 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_USDC_WETH_500, dex: 'sushi'});
const pairsV3SushiUsdcWeth100 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_USDC_WETH_100, dex: 'sushi'});

const pairsV3SushiWethUsdc500 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_USDC_500, dex: 'sushi'});
const pairsV3SushiWethUsdc100 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_USDC_100, dex: 'sushi'});
const pairsV3SushiWethDonut10000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_DONUT_10000, dex: 'sushi'});
const pairsV3SushiWethWsteth100 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_WSTETH_100, dex: 'sushi'});
const pairsV3SushiWethGovi3000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_GOVI_3000, dex: 'sushi'});
const pairsV3SushiWethSnsy10000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_SNSY_10000, dex: 'sushi'});
const pairsV3SushiWethArb3000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_ARB_3000, dex: 'sushi'});
const pairsV3SushiWethArb500 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_ARB_500, dex: 'sushi'});
const pairsV3SushiWethUsdce500 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_USDCE_500, dex: 'sushi'});
const pairsV3SushiWethUsdce3000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_USDCE_3000, dex: 'sushi'});
const pairsV3SushiWethWbtc3000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_WBTC_3000, dex: 'sushi'});
const pairsV3SushiWethZro3000 = getpairsV3UniswapByPoolAddress({poolsSettings: POOLS_SUSHI_WETH_ZRO_3000, dex: 'sushi'});

const pairsUniswap: IPairToQuote[] = [
  ...pairsV3UniswapWethUsdc,
  ...pairsV3UniswapWethUsdt,
  ...pairsV3UniswapWethWbtc,
  ...pairsV3UniswapWethArb,
  ...pairsV3UniswapWethDai,
  ...pairsV3UniswapWethGmx,
  ...pairsV3UniswapWethLink,
  ...pairsV3UniswapWethRain,
  ...pairsV3UniswapWethUsdce,
  ...pairsV3UniswapWethPendle,
  ...pairsV3UniswapWethWstest,
  ...pairsV3UniswapWethUsdplus,
  ...pairsV3UniswapWethMor,
  ...pairsV3UniswapWethCrypto,

  ...pairsV3UniswapUsdcWeth,
  ...pairsV3UniswapUsdcWbtc,
  ...pairsV3UniswapUsdcArb,

  ...pairsV2UniswapUsdcWeth,
  ...pairsV2UniswapUsdcTmx,
  ...pairsV2UniswapUsdcSech,
  ...pairsV2UniswapUsdcWbtc,
  ...pairsV2UniswapUsdcArb,
  ...pairsV2UniswapUsdcDai,
  ...pairsV2UniswapUsdcYep,
  ...pairsV2UniswapUsdcQoda,
  ...pairsV2UniswapUsdcOpul,
  ...pairsV2UniswapUsdcFare,
];

const pairsSushi: IPairToQuote[] = [
  ...pairsV3SushiUsdcWeth500,
  // ...pairsV3SushiUsdcWeth100, // small liquidity pool
  ...pairsV3SushiWethUsdc500,
  // ...pairsV3SushiWethUsdc100, // small liquidity pool
  ...pairsV3SushiWethDonut10000,
  ...pairsV3SushiWethWsteth100,
  ...pairsV3SushiWethGovi3000,
  ...pairsV3SushiWethSnsy10000,
  ...pairsV3SushiWethArb3000,
  ...pairsV3SushiWethArb500,
  ...pairsV3SushiWethUsdce500,
  ...pairsV3SushiWethUsdce3000,
  ...pairsV3SushiWethWbtc3000,
  ...pairsV3SushiWethZro3000,

    ...pairsV2SushiWethHash,
    ...pairsV2SushiWethUsdce,
    ...pairsV2SushiWethMagic,
    ...pairsV2SushiWethDpx,
    ...pairsV2SushiWethArvault,
    ...pairsV2SushiWethSpell,
    ...pairsV2SushiWethArby,
    ...pairsV2SushiWethUsdt,
    ...pairsV2SushiWethWbtc,
    ...pairsV2SushiWethAdoge,
    ...pairsV2SushiWethLiqd,
    ...pairsV2SushiWethMim,
    ...pairsV2SushiWethFluid,
    ...pairsV2SushiWethEmax,
    ...pairsV2SushiWethUsdc,
    ...pairsV2SushiWethJeth,
    ...pairsV2SushiWethSushi,
    ...pairsV2SushiWethPepe,
    ...pairsV2SushiWethFlux,
    ...pairsV2SushiWethOmni,
    ...pairsV2SushiWethHwt,
    ...pairsV2SushiWethGohm,
    ...pairsV2SushiWeth$sharbi,
    ...pairsV2SushiWethLink,
    ...pairsV2SushiWethArb,
    ...pairsV2SushiWethDai,
    ...pairsV2SushiWethGmx,

];

const pairs = [
  ...pairsUniswap,
  ...pairsSushi,
];

const pairsSushiTest: IPairToQuote[] = [
  ...pairsV2SushiWethGmx,
];

console.log('pairsToQuote count:', pairs.length);


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

      pairsToQuote: pairs,

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
