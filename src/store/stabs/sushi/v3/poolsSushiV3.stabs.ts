// poolsSushiV3.stabs.ts
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
import {IPool} from '../../../state.types';

// ==================== USDC / WETH ====================

export const POOL_SUSHI_V3_USDC_WETH_001: IPool = {
  dex: "sushi",
  version: "v3",
  token0: USDC.address,
  token1: WETH.address,
  poolAddress: "0xb658ee5c63922d2852f24458effa2bfa2cba3574",
  feePpm: 100,
};

export const POOL_SUSHI_V3_USDC_WETH_003: IPool = { // не работает
  dex: "sushi",
  version: "v3",
  token0: USDC.address,
  token1: WETH.address,
  poolAddress: "0x763d3b7296e7c9718ad5b058ac2692a19e5b3638",
  feePpm: 300,
};

export const POOL_SUSHI_V3_USDC_WETH_005: IPool = {
  dex: "sushi",
  version: "v3",
  token0: USDC.address,
  token1: WETH.address,
  poolAddress: "0xf3eb87c1f6020982173c908e7eb31aa66c1f0296",
  feePpm: 500,
};

// ==================== WETH / DONUT ====================

export const POOL_SUSHI_V3_WETH_DONUT_1: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: DONUT.address,
  poolAddress: "0x65f7a98d87bc21a3748545047632fef4d3ff9a67",
  feePpm: 10000,
};

// ==================== WETH / WSTETH ====================

export const POOL_SUSHI_V3_WETH_WSTETH_001: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: WSTETH.address,
  poolAddress: "0x8bd39fa8608fd949c253987767540c26a0d974cf",
  feePpm: 100,
};

// ==================== WETH / GOVI ====================

export const POOL_SUSHI_V3_WETH_GOVI_03: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: GOVI.address,
  poolAddress: "0x581f84f5017f275dd5f6f4c045a66b7439331da0",
  feePpm: 3000,
};

// ==================== WETH / SNSY ====================

export const POOL_SUSHI_V3_WETH_SNSY_1: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: SNSY.address,
  poolAddress: "0x8d11274ddeb8b141a24ca8a36c63699214e0d221",
  feePpm: 10000,
};

// ==================== WETH / ARB ====================

export const POOL_SUSHI_V3_WETH_ARB_005: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: ARB.address,
  poolAddress: "0x99543bf98ca1830aa20d3eb12c1b9962f8eadc11",
  feePpm: 500,
};

export const POOL_SUSHI_V3_WETH_ARB_03: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: ARB.address,
  poolAddress: "0xb3942c9ffa04efbc1fa746e146be7565c76e3dc1",
  feePpm: 3000,
};

// ==================== WETH / USDCE ====================

export const POOL_SUSHI_V3_WETH_USDCE_005: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: USDCE.address,
  poolAddress: "0x15e444da5b343c5a0931f5d3e85d158d1efc3d40",
  feePpm: 500,
};

export const POOL_SUSHI_V3_WETH_USDCE_03: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: USDCE.address,
  poolAddress: "0x4d1576158518dd61924218446c1057cf03138d57",
  feePpm: 3000,
};

// ==================== WETH / WBTC ====================

export const POOL_SUSHI_V3_WETH_WBTC_03: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: WBTC.address,
  poolAddress: "0x6f10667f314498649eb2f80da244e8c6e9f031d5",
  feePpm: 3000,
};

// ==================== WETH / ZRO ====================

export const POOL_SUSHI_V3_WETH_ZRO_03: IPool = {
  dex: "sushi",
  version: "v3",
  token0: WETH.address,
  token1: ZRO.address,
  poolAddress: "0x1797538dd80c041cc2f0c5901d5700868186a9a8",
  feePpm: 3000,
};
