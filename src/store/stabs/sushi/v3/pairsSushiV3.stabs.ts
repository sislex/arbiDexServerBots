import { IPair } from "../../../state.types";
import {
  ARB,
  DONUT,
  GOVI,
  SNSY,
  USDC,
  USDCE,
  WBTC,
  WETH,
  WSTETH,
  ZRO,
} from "../../tokens.stabs";

import {
  POOL_SUSHI_V3_USDC_WETH_001,
  POOL_SUSHI_V3_USDC_WETH_005,

  POOL_SUSHI_V3_WETH_DONUT_1,
  POOL_SUSHI_V3_WETH_WSTETH_001,
  POOL_SUSHI_V3_WETH_GOVI_03,
  POOL_SUSHI_V3_WETH_SNSY_1,

  POOL_SUSHI_V3_WETH_ARB_005,
  POOL_SUSHI_V3_WETH_ARB_03,

  POOL_SUSHI_V3_WETH_USDCE_005,
  POOL_SUSHI_V3_WETH_USDCE_03,

  POOL_SUSHI_V3_WETH_WBTC_03,
  POOL_SUSHI_V3_WETH_ZRO_03, POOL_SUSHI_V3_USDC_WETH_003
} from './poolsSushiV3.stabs';


// ======================================================================
// PAIRS
// ======================================================================

// ==================== PAIR: WETH → X ====================

// ---------- USDC / WETH ----------
export const PAIR_SUSHI_V3_USDC_WETH_100_WETH_TO_USDC: IPair = {
  ...POOL_SUSHI_V3_USDC_WETH_001,
  tokenIn: WETH,
  tokenOut: USDC,
};

export const PAIR_SUSHI_V3_USDC_WETH_300_WETH_TO_USDC: IPair = {
  ...POOL_SUSHI_V3_USDC_WETH_003,
  tokenIn: WETH,
  tokenOut: USDC,
};

export const PAIR_SUSHI_V3_USDC_WETH_500_WETH_TO_USDC: IPair = {
  ...POOL_SUSHI_V3_USDC_WETH_005,
  tokenIn: WETH,
  tokenOut: USDC,
};



// ---------- WETH / DONUT ----------
export const PAIR_SUSHI_V3_WETH_DONUT_10000_WETH_TO_DONUT: IPair = {
  ...POOL_SUSHI_V3_WETH_DONUT_1,
  tokenIn: WETH,
  tokenOut: DONUT,
};

// ---------- WETH / WSTETH ----------
export const PAIR_SUSHI_V3_WETH_WSTETH_100_WETH_TO_WSTETH: IPair = {
  ...POOL_SUSHI_V3_WETH_WSTETH_001,
  tokenIn: WETH,
  tokenOut: WSTETH,
};

// ---------- WETH / GOVI ----------
export const PAIR_SUSHI_V3_WETH_GOVI_3000_WETH_TO_GOVI: IPair = {
  ...POOL_SUSHI_V3_WETH_GOVI_03,
  tokenIn: WETH,
  tokenOut: GOVI,
};

// ---------- WETH / SNSY ----------
export const PAIR_SUSHI_V3_WETH_SNSY_10000_WETH_TO_SNSY: IPair = {
  ...POOL_SUSHI_V3_WETH_SNSY_1,
  tokenIn: WETH,
  tokenOut: SNSY,
};

// ---------- WETH / ARB ----------
export const PAIR_SUSHI_V3_WETH_ARB_500_WETH_TO_ARB: IPair = {
  ...POOL_SUSHI_V3_WETH_ARB_005,
  tokenIn: WETH,
  tokenOut: ARB,
};

export const PAIR_SUSHI_V3_WETH_ARB_3000_WETH_TO_ARB: IPair = {
  ...POOL_SUSHI_V3_WETH_ARB_03,
  tokenIn: WETH,
  tokenOut: ARB,
};

// ---------- WETH / USDCE ----------
export const PAIR_SUSHI_V3_WETH_USDCE_500_WETH_TO_USDCE: IPair = {
  ...POOL_SUSHI_V3_WETH_USDCE_005,
  tokenIn: WETH,
  tokenOut: USDCE,
};

export const PAIR_SUSHI_V3_WETH_USDCE_3000_WETH_TO_USDCE: IPair = {
  ...POOL_SUSHI_V3_WETH_USDCE_03,
  tokenIn: WETH,
  tokenOut: USDCE,
};

// ---------- WETH / WBTC ----------
export const PAIR_SUSHI_V3_WETH_WBTC_3000_WETH_TO_WBTC: IPair = {
  ...POOL_SUSHI_V3_WETH_WBTC_03,
  tokenIn: WETH,
  tokenOut: WBTC,
};

// ---------- WETH / ZRO ----------
export const PAIR_SUSHI_V3_WETH_ZRO_3000_WETH_TO_ZRO: IPair = {
  ...POOL_SUSHI_V3_WETH_ZRO_03,
  tokenIn: WETH,
  tokenOut: ZRO,
};


// ==================== PAIR: USDC → X ====================

// ---------- USDC / WETH ----------
export const PAIR_SUSHI_V3_USDC_WETH_100_USDC_TO_WETH: IPair = {
  ...POOL_SUSHI_V3_USDC_WETH_001,
  tokenIn: USDC,
  tokenOut: WETH,
};

export const PAIR_SUSHI_V3_USDC_WETH_500_USDC_TO_WETH: IPair = {
  ...POOL_SUSHI_V3_USDC_WETH_005,
  tokenIn: USDC,
  tokenOut: WETH,
};


// ======================================================================
// GROUPS (same style as Uniswap)
// ======================================================================

// ==================== ALL PAIRS: WETH → X (SUSHI) ====================

export const PAIRS_SUSHI_WETH_OUT: IPair[] = [
  // USDC
  // PAIR_SUSHI_V3_USDC_WETH_100_WETH_TO_USDC, // очень небольшой ликвидности
  // PAIR_SUSHI_V3_USDC_WETH_300_WETH_TO_USDC,
  PAIR_SUSHI_V3_USDC_WETH_500_WETH_TO_USDC,

  // // DONUT
  // PAIR_SUSHI_V3_WETH_DONUT_10000_WETH_TO_DONUT,

  // WSTETH
  PAIR_SUSHI_V3_WETH_WSTETH_100_WETH_TO_WSTETH,

  // // GOVI
  // PAIR_SUSHI_V3_WETH_GOVI_3000_WETH_TO_GOVI,

  // SNSY
  PAIR_SUSHI_V3_WETH_SNSY_10000_WETH_TO_SNSY,

  // ARB
  PAIR_SUSHI_V3_WETH_ARB_500_WETH_TO_ARB,
  PAIR_SUSHI_V3_WETH_ARB_3000_WETH_TO_ARB,

  // USDCE
  PAIR_SUSHI_V3_WETH_USDCE_500_WETH_TO_USDCE,
  PAIR_SUSHI_V3_WETH_USDCE_3000_WETH_TO_USDCE,

  // WBTC
  PAIR_SUSHI_V3_WETH_WBTC_3000_WETH_TO_WBTC,

  // ZRO
  PAIR_SUSHI_V3_WETH_ZRO_3000_WETH_TO_ZRO,
];


// ==================== ALL PAIRS: USDC → X (SUSHI) ====================

export const PAIRS_SUSHI_USDC_OUT: IPair[] = [
  // WETH
  PAIR_SUSHI_V3_USDC_WETH_100_USDC_TO_WETH,
  PAIR_SUSHI_V3_USDC_WETH_500_USDC_TO_WETH,
];
