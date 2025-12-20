import { IPoolSettings } from "../state.types";
import {ARB, DAI, GMX, LINK, PENDLE, RAIN, USDC, USDCE, USDT, WBTC, WETH, WSTETH} from './tokens.stabs';

// -------------------- USDC / WETH -------------------- +

export const POOL_UNISWAP_V3_USDC_WETH_001: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WETH,
  poolAddress: "0x6f38e884725a116C9C7fBF208e79FE8828a2595F",
  feePpm: 100,
};

export const POOL_UNISWAP_V3_USDC_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WETH,
  poolAddress: "0xC6962004f452bE9203591991D15f6b388e09E8D0",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_USDC_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WETH,
  poolAddress: "0xc473e2aEE3441BF9240Be85eb122aBB059A3B57c",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_USDC_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WETH,
  poolAddress: "0x42FC852A750BA93D5bf772ecdc857e87a86403a9",
  feePpm: 10000,
};

// -------------------- USDT / WETH --------------------

export const POOL_UNISWAP_V3_USDT_WETH_001: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDT,
  token1: WETH,
  poolAddress: "0x42161084d0672e1d3F26a9B53E653bE2084ff19C",
  feePpm: 100,
};

export const POOL_UNISWAP_V3_USDT_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDT,
  token1: WETH,
  poolAddress: "0x641C00A822e8b671738d32a431a4Fb6074E5c79d",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_USDT_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDT,
  token1: WETH,
  poolAddress: "0xc82819F72A9e77E2c0c3A69B3196478f44303cf4",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_USDT_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDT,
  token1: WETH,
  poolAddress: "0x58039203442C9F2A45D5536bd021a383C7f3035C",
  feePpm: 10000,
};

// -------------------- WBTC / WETH --------------------

export const POOL_UNISWAP_V3_WBTC_WETH_001: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: WBTC,
  token1: WETH,
  poolAddress: "0x03a3bE7Ab4aa263D42d63B6CC594F4fb3D3F3951",
  feePpm: 100,
};

export const POOL_UNISWAP_V3_WBTC_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: WBTC,
  token1: WETH,
  poolAddress: "0x2f5e87C9312fa29aed5c179E456625D79015299c",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_WBTC_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: WBTC,
  token1: WETH,
  poolAddress: "0x149e36E72726e0BceA5c59d40df2c43F60f5A22D",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_WBTC_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: WBTC,
  token1: WETH,
  poolAddress: "0x99dFc0126ED31E0169fc32dB6B89adF9FeE9a77e",
  feePpm: 10000,
};

// -------------------- ARB / WETH --------------------

export const POOL_UNISWAP_V3_ARB_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: ARB,
  token1: WETH,
  poolAddress: "0xC6F780497A95e246EB9449f5e4770916DCd6396A",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_ARB_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: ARB,
  token1: WETH,
  poolAddress: "0x92c63d0e701CAAe670C9415d91C474F686298f00",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_ARB_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: ARB,
  token1: WETH,
  poolAddress: "0x92fd143A8FA0C84e016C2765648B9733b0aa519e",
  feePpm: 10000,
};

// -------------------- DAI / WETH --------------------

export const POOL_UNISWAP_V3_DAI_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: DAI,
  token1: WETH,
  poolAddress: "0x31Fa55e03bAD93C7f8AFfdd2eC616EbFde246001",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_DAI_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: DAI,
  token1: WETH,
  poolAddress: "0xA961F0473dA4864C5eD28e00FcC53a3AAb056c1b",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_DAI_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: DAI,
  token1: WETH,
  poolAddress: "0x2E630136c42BC72f1285743347ba77A75077aff4",
  feePpm: 10000,
};

// -------------------- GMX / WETH --------------------

export const POOL_UNISWAP_V3_GMX_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: GMX,
  token1: WETH,
  poolAddress: "0x1aEEdD3727A6431b8F070C0aFaA81Cc74f273882",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_GMX_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: GMX,
  token1: WETH,
  poolAddress: "0x80A9ae39310abf666A87C743d6ebBD0E8C42158E",
  feePpm: 10000,
};

// -------------------- LINK / WETH --------------------

export const POOL_UNISWAP_V3_LINK_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: LINK,
  token1: WETH,
  poolAddress: "0x91308bC9Ce8Ca2db82aA30C65619856cC939d907",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_LINK_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: LINK,
  token1: WETH,
  poolAddress: "0x468b88941e7Cc0B88c1869d68ab6b570bCEF62Ff",
  feePpm: 3000,
};

// -------------------- RAIN / WETH --------------------

export const POOL_UNISWAP_V3_RAIN_WETH_001: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: RAIN,
  token1: WETH,
  poolAddress: "0xd13040d4fe917EE704158CfCB3338dCd2838B245",
  feePpm: 100,
};

export const POOL_UNISWAP_V3_RAIN_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: RAIN,
  token1: WETH,
  poolAddress: "0xD491076C7316bC28fD4D35E3da9aB5286D079250",
  feePpm: 10000,
};

// -------------------- USDCE / WETH --------------------

export const POOL_UNISWAP_V3_USDCE_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDCE,
  token1: WETH,
  poolAddress: "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_USDCE_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDCE,
  token1: WETH,
  poolAddress: "0x17c14D2c404D167802b16C450d3c99F88F2c4F4d",
  feePpm: 3000,
};

// -------------------- PENDLE / WETH --------------------

export const POOL_UNISWAP_V3_PENDLE_WETH_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: PENDLE,
  token1: WETH,
  poolAddress: "0xB08a8794A5D3cCCA3725D92964696858d3201909",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_PENDLE_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: PENDLE,
  token1: WETH,
  poolAddress: "0xdbaeB7f0DFe3a0AAFD798CCECB5b22E708f7852c",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_PENDLE_WETH_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: PENDLE,
  token1: WETH,
  poolAddress: "0xe8629b6A488F366D27DAd801D1b5B445199e2Ada",
  feePpm: 10000,
};

// -------------------- WSTETH / WETH --------------------

export const POOL_UNISWAP_V3_WSTETH_WETH_001: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: WSTETH,
  token1: WETH,
  poolAddress: "0x35218a1cbaC5Bbc3E57fd9Bd38219D37571b3537",
  feePpm: 100,
};

export const POOL_UNISWAP_V3_WSTETH_WETH_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: WSTETH,
  token1: WETH,
  poolAddress: "0x7103B8F34473C7812818C55EB127D1F590F67D84",
  feePpm: 3000,
};

// -------------------- USDC / WBTC --------------------

export const POOL_UNISWAP_V3_USDC_WBTC_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WBTC,
  poolAddress: "0x0E4831319A50228B9e450861297aB92dee15B44F",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_USDC_WBTC_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WBTC,
  poolAddress: "0x6985cb98CE393FCE8d6272127F39013f61e36166",
  feePpm: 3000,
};

export const POOL_UNISWAP_V3_USDC_WBTC_1: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: WBTC,
  poolAddress: "0x719826896832C9DeAA868272f2dD55CF1e5Ca3e7",
  feePpm: 10000,
};

// -------------------- USDC / ARB --------------------

export const POOL_UNISWAP_V3_USDC_ARB_005: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: ARB,
  poolAddress: "0xb0f6cA40411360c03d41C5fFc5F179b8403CdcF8",
  feePpm: 500,
};

export const POOL_UNISWAP_V3_USDC_ARB_03: IPoolSettings = {
  dex: "uniswap",
  version: "v3",
  token0: USDC,
  token1: ARB,
  poolAddress: "0xaEBDcA1Bc8d89177EbE2308d62af5e74885DcCc3",
  feePpm: 3000,
};

// -------------------- ALL --------------------

export const ALL_UNISWAP_V3_POOLS: IPoolSettings[] = [
  POOL_UNISWAP_V3_USDC_WETH_001,
  POOL_UNISWAP_V3_USDC_WETH_005,
  POOL_UNISWAP_V3_USDC_WETH_03,
  POOL_UNISWAP_V3_USDC_WETH_1,

  POOL_UNISWAP_V3_USDT_WETH_001,
  POOL_UNISWAP_V3_USDT_WETH_005,
  POOL_UNISWAP_V3_USDT_WETH_03,
  POOL_UNISWAP_V3_USDT_WETH_1,

  POOL_UNISWAP_V3_WBTC_WETH_001,
  POOL_UNISWAP_V3_WBTC_WETH_005,
  POOL_UNISWAP_V3_WBTC_WETH_03,
  POOL_UNISWAP_V3_WBTC_WETH_1,

  POOL_UNISWAP_V3_ARB_WETH_005,
  POOL_UNISWAP_V3_ARB_WETH_03,
  POOL_UNISWAP_V3_ARB_WETH_1,

  POOL_UNISWAP_V3_DAI_WETH_005,
  POOL_UNISWAP_V3_DAI_WETH_03,
  POOL_UNISWAP_V3_DAI_WETH_1,

  POOL_UNISWAP_V3_GMX_WETH_03,
  POOL_UNISWAP_V3_GMX_WETH_1,

  POOL_UNISWAP_V3_LINK_WETH_005,
  POOL_UNISWAP_V3_LINK_WETH_03,

  POOL_UNISWAP_V3_RAIN_WETH_001,
  POOL_UNISWAP_V3_RAIN_WETH_1,

  POOL_UNISWAP_V3_USDCE_WETH_005,
  POOL_UNISWAP_V3_USDCE_WETH_03,

  POOL_UNISWAP_V3_PENDLE_WETH_005,
  POOL_UNISWAP_V3_PENDLE_WETH_03,
  POOL_UNISWAP_V3_PENDLE_WETH_1,

  POOL_UNISWAP_V3_WSTETH_WETH_001,
  POOL_UNISWAP_V3_WSTETH_WETH_03,

  POOL_UNISWAP_V3_USDC_WBTC_005,
  POOL_UNISWAP_V3_USDC_WBTC_03,
  POOL_UNISWAP_V3_USDC_WBTC_1,

  POOL_UNISWAP_V3_USDC_ARB_005,
  POOL_UNISWAP_V3_USDC_ARB_03,
];
