import {BuildQuotesParams, IQuote} from '../../../state.types';
import {
  PAIR_UNISWAP_V3_USDC_WBTC_500_USDC_TO_WBTC,
  PAIRS_USDC_OUT,
  PAIRS_WETH_OUT,
  PAIRS_WETH_OUT_TEST
} from './pairsUniswapV3.stabs';
import {AMOUNT_0003_18, AMOUNT_003_18, AMOUNT_03_18, AMOUNT_100_6, AMOUNT_1_18} from '../../pricses.stabs';

export function buildQuotes(params: BuildQuotesParams): IQuote[] {
  const {
    pairs,
    amount,
    side = "exactIn",
    blockTag = "latest",
    quoteSource,
    createdAt = new Date().toISOString(),
  } = params;

  return pairs.map<IQuote>(pair => ({
    ...pair,
    side,
    amount,
    blockTag,
    quoteSource,
    createdAt,
  }));
}


export const quotesWethOut = buildQuotes({
  pairs: PAIRS_WETH_OUT,
  amount: AMOUNT_03_18,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "uniswap-v3-quoter-v2",
});

export const quotesWethOut0003 = buildQuotes({
  pairs: PAIRS_WETH_OUT_TEST,
  amount: AMOUNT_0003_18,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "uniswap-v3-quoter-v2",
});

export const quotesUsdcOut = buildQuotes({
  pairs: PAIRS_USDC_OUT,
  amount: AMOUNT_100_6,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "uniswap-v3-quoter-v2",
});
