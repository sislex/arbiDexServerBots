import {
  DexId,
  IBotsRule,
  IBotType,
  IJobType,
  IPairToQuote,
  IPool,
  ITokenInfo,
  PoolVersion,
  QuoteSource
} from '../state.types';
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
import {POOL_UNISWAP_V3_USDC_WETH_001} from './uniswap/poolsUniswapV3.stabs';
import {PAIRS_USDC_OUT} from './uniswap/pairsUniswapV3.stabs';
import {quotesBothTest, quotesUniTest, quotesWethOut} from './uniswap/quotesUniswapV3.stabs';
import {quotesSushiUsdcOut, quotesSushiWethOut} from './sushi/quotesSushiV3.stabs';

export interface IPairsToQuoteParams {
  poolsSettings: IPoolsSettings;
  quoteSource?: QuoteSource;
  dex?: DexId;
  version?: PoolVersion;
  feePpmList?: number[];
  amount?: string;
}

export interface IPairToQuoteParams {
  poolSettings: IPool;
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amount: string;
  quoteSource: QuoteSource;
}

const AMOUNT_USDC_100 = parseUnits("100", USDC.decimals).toString();
const AMOUNT_WETH_003 = parseUnits("0.03", WETH.decimals).toString();

export interface IPoolsSettings {
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  amountList: string[];
  poolAddress?: string;
  feePpm: number;
}

const POOLS_SUSHI_WETH_HASH: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: HASH,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_USDCE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDCE,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_MAGIC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: MAGIC,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_DPX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: DPX,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ARVAULT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARVAULT,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_SPELL: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: SPELL,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ARBY: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARBY,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_USDT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDT,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_WBTC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: WBTC,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ADOGE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ADOGE,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_LIQD: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: LIQD,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_MIM: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: MIM,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_FLUID: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: FLUID,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_EMAX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: EMAX,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_USDC: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: USDC,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_JETH: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: JETH,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_SUSHI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: SUSHI,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_PEPE: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: PEPE,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_FLUX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: FLUX,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_OMNI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: OMNI,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_HWT: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: HWT,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_GOHM: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: GOHM,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_$SHARBI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: $SHARBI,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_LINK: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: LINK,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_ARB: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: ARB,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_DAI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: DAI,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

const POOLS_SUSHI_WETH_GMX: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: GMX,
  amountList: [AMOUNT_WETH_003],
  feePpm: 3000,
};

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
        // pairUniswapV3,
        // pairUniswapV3Simulation,
        ...quotesSushiWethOut,
        ...quotesSushiUsdcOut,
      ],

    }
  },

];
