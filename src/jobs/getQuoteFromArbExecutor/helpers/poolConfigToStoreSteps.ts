import {ethers} from 'ethers';

/**
 * Maps dex name → V2 router address on Arbitrum.
 * V3 pools don't use a router (pool address is used directly).
 */
const V2_ROUTERS: Record<string, string> = {
  uniswap: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24", // Uniswap V2 Router on Arbitrum
  sushi:   "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // SushiSwap V2 Router on Arbitrum
  camelot: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d", // Camelot V2 Router on Arbitrum
};

export type PoolConfig = {
  dex: string;
  version: string;
  poolAddress: string;
  tokenIn: { address: string };
  tokenOut: { address: string };
  [key: string]: unknown;
};

export type StoreSwapStep = {
  kind: number;
  router: string;
  path: string[];
  pool: string;
  tokenIn: string;
  tokenOut: string;
};

/**
 * Convert a single pool config from stabs format
 * to a SwapStepsConfigStore.SwapStep struct.
 *
 * - v2 → kind=0, router from dex map, path=[tokenIn, tokenOut], pool=zero
 * - v3 → kind=1, router=zero, path=[], pool=poolAddress
 */
export function poolConfigToStoreStep(cfg: PoolConfig): StoreSwapStep {
  const ZERO = ethers.ZeroAddress;

  if (cfg.version === "v2") {
    const router = V2_ROUTERS[cfg.dex];
    if (!router) throw new Error(`Unknown V2 dex: ${cfg.dex}`);

    // Camelot V2 → kind=2 (CAMELOT_V2_EXACT_IN), others → kind=0 (V2_EXACT_IN)
    const kind = cfg.dex === "camelot" ? 2 : 0;

    return {
      kind,
      router,
      path: [cfg.tokenIn.address, cfg.tokenOut.address],
      pool: ZERO,
      tokenIn: cfg.tokenIn.address,
      tokenOut: cfg.tokenOut.address,
    };
  }

  if (cfg.version === "v3") {
    // Camelot V3 / Algebra → kind=3 (ALGEBRA_POOL_EXACT_IN), others → kind=1 (V3_POOL_EXACT_IN)
    const kind = cfg.dex === "camelot" ? 3 : 1;

    return {
      kind,
      router: ZERO,
      path: [],
      pool: cfg.poolAddress,
      tokenIn: cfg.tokenIn.address,
      tokenOut: cfg.tokenOut.address,
    };
  }

  throw new Error(`Unknown version: ${cfg.version}`);
}

/**
 * Convert an array of pool configs to an array of store steps.
 * Used to store all pools under a single key (e.g. "weth").
 */
export function poolConfigsToStoreSteps(cfgs: PoolConfig[]): StoreSwapStep[] {
  return cfgs.map(poolConfigToStoreStep);
}
