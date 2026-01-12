// quotesSushiV2.stabs.ts
import { BuildQuotesParams, IQuote } from "../../../state.types";

import {
  PAIRS_SUSHI_V2_WETH_OUT,
  // если позже добавишь группы USDC → X для v2 — просто подключишь тут
  // PAIRS_SUSHI_V2_USDC_OUT,
} from "./pairsSushiV2.stabs";

import {AMOUNT_0003_18, AMOUNT_003_18, AMOUNT_03_18, AMOUNT_100_6, AMOUNT_1_18} from '../../pricses.stabs';

// ======================================================================
// buildQuotes (shared logic, 1-в-1 как у Uni / Sushi V3)
// ======================================================================

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

// ======================================================================
// SUSHI V2: WETH → X
// ======================================================================

export const quotesSushiV2WethOut = buildQuotes({
  pairs: PAIRS_SUSHI_V2_WETH_OUT,
  amount: AMOUNT_03_18,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "uniswap-v2-router", // 🔑 для v2 всегда router
});

export const quotesSushiV2WethOut0003 = buildQuotes({
  pairs: PAIRS_SUSHI_V2_WETH_OUT,
  amount: AMOUNT_0003_18,
  side: "exactIn",
  blockTag: "latest",
  quoteSource: "uniswap-v2-router", // 🔑 для v2 всегда router
});

// ======================================================================
// (опционально, задел на будущее)
// SUSHI V2: USDC → X
// ======================================================================
//
// export const quotesSushiV2UsdcOut = buildQuotes({
//   pairs: PAIRS_SUSHI_V2_USDC_OUT,
//   amount: AMOUNT_100_6,
//   side: "exactIn",
//   blockTag: "latest",
//   quoteSource: "uniswap-v2-router",
// });
