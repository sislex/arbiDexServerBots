import { BuildQuotesParams, IQuote } from "../../../state.types";

import {
  PAIRS_SUSHI_WETH_OUT,
  PAIRS_SUSHI_USDC_OUT,
  PAIR_SUSHI_V3_USDC_WETH_100_USDC_TO_WETH,
} from "./pairsSushiV3.stabs";

import { AMOUNT_003_18, AMOUNT_100_6 } from "../../pricses.stabs";

// ==================== buildQuotes (shared logic) ====================

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

// ==================== SUSHI: WETH → X ====================

export const quotesSushiWethOut = buildQuotes({
  pairs: PAIRS_SUSHI_WETH_OUT,
  amount: AMOUNT_003_18,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "quoteBothBase",
});

// ==================== SUSHI: USDC → X ====================

export const quotesSushiUsdcOut = buildQuotes({
  pairs: PAIRS_SUSHI_USDC_OUT,
  amount: AMOUNT_100_6,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "quoteBothBase",
});
