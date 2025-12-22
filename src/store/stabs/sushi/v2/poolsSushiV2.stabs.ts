// poolsSushiV2.stabs.ts
import {
  ADOGE,
  ARB,
  ARBY,
  ARVAULT,
  DAI,
  DPX,
  EMAX,
  FLUID,
  FLUX,
  GMX,
  GOHM,
  HASH,
  HWT,
  JETH,
  LINK,
  LIQD,
  MAGIC,
  MIM,
  OMNI,
  PEPE,
  SHARBI,
  SPELL,
  SUSHI,
  USDC,
  USDCE,
  USDT,
  WBTC,
  WETH,
} from "../../tokens.stabs";
import {IPool} from '../../../state.types';

// ======================================================================
// SushiSwap V2 pools (pair addresses resolved via factory.getPair)
// NOTE: Sushi V2 не имеет fee tiers как V3; feePpm здесь оставлен для унификации (обычно 0.3% => 3000)
// ======================================================================

// -------------------- WETH / HASH --------------------

export const POOL_SUSHI_V2_WETH_HASH_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: HASH,
  poolAddress: "0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703",
  feePpm: 3000,
};

// -------------------- WETH / USDCE --------------------

export const POOL_SUSHI_V2_WETH_USDCE_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: USDCE,
  poolAddress: "0x905dfCD5649217c42684f23958568e533C711Aa3",
  feePpm: 3000,
};

// -------------------- WETH / MAGIC --------------------

export const POOL_SUSHI_V2_WETH_MAGIC_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: MAGIC,
  poolAddress: "0xB7E50106A5bd3Cf21AF210A755F9C8740890A8c9",
  feePpm: 3000,
};

// -------------------- WETH / DPX --------------------

export const POOL_SUSHI_V2_WETH_DPX_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: DPX,
  poolAddress: "0x0C1Cf6883efA1B496B01f654E247B9b419873054",
  feePpm: 3000,
};

// -------------------- WETH / ARVAULT --------------------

export const POOL_SUSHI_V2_WETH_ARVAULT_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: ARVAULT,
  poolAddress: "0x5b772b00Cb6B95c4501E4be75ce7ddD6CB625320",
  feePpm: 3000,
};

// -------------------- WETH / SPELL --------------------

export const POOL_SUSHI_V2_WETH_SPELL_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: SPELL,
  poolAddress: "0x8f93Eaae544e8f5EB077A1e09C1554067d9e2CA8",
  feePpm: 3000,
};

// -------------------- WETH / ARBY --------------------

export const POOL_SUSHI_V2_WETH_ARBY_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: ARBY,
  poolAddress: "0xc5fFd083B983AAF823a9b485b207F898ed2f32DC",
  feePpm: 3000,
};

// -------------------- WETH / USDT --------------------

export const POOL_SUSHI_V2_WETH_USDT_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: USDT,
  poolAddress: "0xCB0E5bFa72bBb4d16AB5aA0c60601c438F04b4ad",
  feePpm: 3000,
};

// -------------------- WETH / WBTC --------------------

export const POOL_SUSHI_V2_WETH_WBTC_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: WBTC,
  poolAddress: "0x515e252b2b5c22b4b2b6Df66c2eBeeA871AA4d69",
  feePpm: 3000,
};

// -------------------- WETH / ADOGE --------------------

export const POOL_SUSHI_V2_WETH_ADOGE_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: ADOGE,
  poolAddress: "0x11EECDBD8f2D670016D061E4c064072E6158Ede2",
  feePpm: 3000,
};

// -------------------- WETH / LIQD --------------------

export const POOL_SUSHI_V2_WETH_LIQD_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: LIQD,
  poolAddress: "0x5dCF474814515B58ca0CA5e80bbB00d18C5B5cF8",
  feePpm: 3000,
};

// -------------------- WETH / MIM --------------------

export const POOL_SUSHI_V2_WETH_MIM_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: MIM,
  poolAddress: "0xb6DD51D5425861C808Fd60827Ab6CFBfFE604959",
  feePpm: 3000,
};

// -------------------- WETH / FLUID --------------------

export const POOL_SUSHI_V2_WETH_FLUID_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: FLUID,
  poolAddress: "0x3B1AfeED07b49652dF107145feB493C251545619",
  feePpm: 3000,
};

// -------------------- WETH / EMAX --------------------

export const POOL_SUSHI_V2_WETH_EMAX_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: EMAX,
  poolAddress: "0x9c5397dBCD8B039c5fc8b1Bc2602fA2767567149",
  feePpm: 3000,
};

// -------------------- WETH / USDC --------------------

export const POOL_SUSHI_V2_WETH_USDC_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: USDC,
  poolAddress: "0x57b85FEf094e10b5eeCDF350Af688299E9553378",
  feePpm: 3000,
};

// -------------------- WETH / JETH --------------------

export const POOL_SUSHI_V2_WETH_JETH_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: JETH,
  poolAddress: "0xDF1A6Dd4E5b77d7F2143eD73074bE26c806754c5",
  feePpm: 3000,
};

// -------------------- WETH / SUSHI --------------------

export const POOL_SUSHI_V2_WETH_SUSHI_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: SUSHI,
  poolAddress: "0x3221022e37029923aCe4235D812273C5A42C322d",
  feePpm: 3000,
};

// -------------------- WETH / PEPE --------------------

export const POOL_SUSHI_V2_WETH_PEPE_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: PEPE,
  poolAddress: "0x6Dc147be79e625E5C9033651238CCce973a0950c",
  feePpm: 3000,
};

// -------------------- WETH / FLUX --------------------

export const POOL_SUSHI_V2_WETH_FLUX_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: FLUX,
  poolAddress: "0x088F6dCDe862781db7b01fEB67afd265aBbC6d90",
  feePpm: 3000,
};

// -------------------- WETH / OMNI --------------------

export const POOL_SUSHI_V2_WETH_OMNI_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: OMNI,
  poolAddress: "0x75fa3Be54d5B3571ed19F3eeace61fA1566eF948",
  feePpm: 3000,
};

// -------------------- WETH / HWT --------------------

export const POOL_SUSHI_V2_WETH_HWT_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: HWT,
  poolAddress: "0x3EcC5A0d8b3456c5E1ab2B110f0a4da923dC49Ec",
  feePpm: 3000,
};

// -------------------- WETH / GOHM --------------------

export const POOL_SUSHI_V2_WETH_GOHM_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: GOHM,
  poolAddress: "0xaa5bD49f2162ffdC15634c87A77AC67bD51C6a6D",
  feePpm: 3000,
};

// -------------------- WETH / SHARBI --------------------

export const POOL_SUSHI_V2_WETH_SHARBI_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: SHARBI,
  poolAddress: "0xC0b4D8AFFe04aD24CE6C52672A885DF669EF3F9A",
  feePpm: 3000,
};

// -------------------- WETH / LINK --------------------

export const POOL_SUSHI_V2_WETH_LINK_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: LINK,
  poolAddress: "0x7050A8908E2a60899D8788015148241f0993a3FD",
  feePpm: 3000,
};

// -------------------- WETH / ARB --------------------

export const POOL_SUSHI_V2_WETH_ARB_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: ARB,
  poolAddress: "0xBF6CBb1F40a542aF50839CaD01b0dc1747F11e18",
  feePpm: 3000,
};

// -------------------- WETH / DAI --------------------

export const POOL_SUSHI_V2_WETH_DAI_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: DAI,
  poolAddress: "0x692a0B300366D1042679397e40f3d2cb4b8F7D30",
  feePpm: 3000,
};

// -------------------- WETH / GMX --------------------

export const POOL_SUSHI_V2_WETH_GMX_03: IPool = {
  dex: "sushi",
  version: "v2",
  token0: WETH,
  token1: GMX,
  poolAddress: "0x05C6F695Ad50C16299BEdCa3Fe9059B56550082f",
  feePpm: 3000,
};

// ======================================================================
// Optional: group all WETH→X pools in one array (handy for mass-ops)
// ======================================================================

export const POOLS_SUSHI_V2_WETH_OUT: IPool[] = [
  POOL_SUSHI_V2_WETH_HASH_03,
  POOL_SUSHI_V2_WETH_USDCE_03,
  POOL_SUSHI_V2_WETH_MAGIC_03,
  POOL_SUSHI_V2_WETH_DPX_03,
  POOL_SUSHI_V2_WETH_ARVAULT_03,
  POOL_SUSHI_V2_WETH_SPELL_03,
  POOL_SUSHI_V2_WETH_ARBY_03,
  POOL_SUSHI_V2_WETH_USDT_03,
  POOL_SUSHI_V2_WETH_WBTC_03,
  POOL_SUSHI_V2_WETH_ADOGE_03,
  POOL_SUSHI_V2_WETH_LIQD_03,
  POOL_SUSHI_V2_WETH_MIM_03,
  POOL_SUSHI_V2_WETH_FLUID_03,
  POOL_SUSHI_V2_WETH_EMAX_03,
  POOL_SUSHI_V2_WETH_USDC_03,
  POOL_SUSHI_V2_WETH_JETH_03,
  POOL_SUSHI_V2_WETH_SUSHI_03,
  POOL_SUSHI_V2_WETH_PEPE_03,
  POOL_SUSHI_V2_WETH_FLUX_03,
  POOL_SUSHI_V2_WETH_OMNI_03,
  POOL_SUSHI_V2_WETH_HWT_03,
  POOL_SUSHI_V2_WETH_GOHM_03,
  POOL_SUSHI_V2_WETH_SHARBI_03,
  POOL_SUSHI_V2_WETH_LINK_03,
  POOL_SUSHI_V2_WETH_ARB_03,
  POOL_SUSHI_V2_WETH_DAI_03,
  POOL_SUSHI_V2_WETH_GMX_03,
];
