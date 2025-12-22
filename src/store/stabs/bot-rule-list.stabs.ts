import {
  DexId,
  IBotsRule,
  IBotType,
  IJobType,
  IPool,
  ITokenInfo,
  PoolVersion,
  QuoteSource
} from '../state.types';
import {parseUnits} from 'ethers';
import {
  SHARBI,
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
import {quotesSushiUsdcOut, quotesSushiWethOut} from './sushi/v3/quotesSushiV3.stabs';
import {hydrateSushiV2Pools} from '../../helpers/hydrateSushiV2Pools';
import {quotesSushiV2WethOut} from './sushi/v2/quotesSushiV2.stabs';
import {quotesUsdcOut, quotesWethOut} from './uniswap/v3/quotesUniswapV3.stabs';

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

const POOLS_SUSHI_WETH_SHARBI: IPoolsSettings = {
  tokenIn: WETH,
  tokenOut: SHARBI,
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

export const POOLS_SUSHI_WETH_ALL: IPoolsSettings[] = [
  POOLS_SUSHI_WETH_HASH,
  POOLS_SUSHI_WETH_USDCE,
  POOLS_SUSHI_WETH_MAGIC,
  POOLS_SUSHI_WETH_DPX,
  POOLS_SUSHI_WETH_ARVAULT,
  POOLS_SUSHI_WETH_SPELL,
  POOLS_SUSHI_WETH_ARBY,
  POOLS_SUSHI_WETH_USDT,
  POOLS_SUSHI_WETH_WBTC,
  POOLS_SUSHI_WETH_ADOGE,
  POOLS_SUSHI_WETH_LIQD,
  POOLS_SUSHI_WETH_MIM,
  POOLS_SUSHI_WETH_FLUID,
  POOLS_SUSHI_WETH_EMAX,
  POOLS_SUSHI_WETH_USDC,
  POOLS_SUSHI_WETH_JETH,
  POOLS_SUSHI_WETH_SUSHI,
  POOLS_SUSHI_WETH_PEPE,
  POOLS_SUSHI_WETH_FLUX,
  POOLS_SUSHI_WETH_OMNI,
  POOLS_SUSHI_WETH_HWT,
  POOLS_SUSHI_WETH_GOHM,
  POOLS_SUSHI_WETH_SHARBI,
  POOLS_SUSHI_WETH_LINK,
  POOLS_SUSHI_WETH_ARB,
  POOLS_SUSHI_WETH_DAI,
  POOLS_SUSHI_WETH_GMX,
];

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
