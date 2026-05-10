import { ethers } from 'ethers';
import { NetworkEnvPrefix, PoolQuoteConfig } from './types';

type StoreSwapStep = {
  kind: number;
  router: string;
  path: string[];
  pool: string;
  tokenIn: string;
  tokenOut: string;
  v4Fee: number;
  v4TickSpacing: number;
  v4Hooks: string;
};

const ARBITRUM_V2_FALLBACK: Record<string, string> = {
  uniswap: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  sushi: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  camelot: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
};

function getV2RouterByDex(dex: string, envPrefix: NetworkEnvPrefix): string {
  const normalizedDex = dex.trim().toLowerCase();

  if (normalizedDex === 'uniswap') {
    return process.env[`${envPrefix}_UNISWAP_V2_ROUTER`] ?? ARBITRUM_V2_FALLBACK.uniswap;
  }

  if (normalizedDex === 'sushi') {
    return process.env[`${envPrefix}_SUSHISWAP_V2_ROUTER`] ?? ARBITRUM_V2_FALLBACK.sushi;
  }

  if (normalizedDex === 'camelot') {
    return process.env[`${envPrefix}_CAMELOT_V2_ROUTER`] ?? ARBITRUM_V2_FALLBACK.camelot;
  }

  throw new Error(`Unsupported v2 dex: ${dex}`);
}

export function buildStoreStep(
  pool: PoolQuoteConfig,
  tokenIn: string,
  tokenOut: string,
  envPrefix: NetworkEnvPrefix,
): StoreSwapStep {
  const ZERO = ethers.ZeroAddress;
  const version = pool.version.trim().toLowerCase();
  const dex = pool.dex.trim().toLowerCase();

  const base = {
    v4Fee: 0,
    v4TickSpacing: 0,
    v4Hooks: ZERO,
  };

  if (version === 'v2') {
    const kind = dex === 'camelot' ? 2 : 0;

    return {
      ...base,
      kind,
      router: getV2RouterByDex(dex, envPrefix),
      path: [tokenIn, tokenOut],
      pool: ZERO,
      tokenIn,
      tokenOut,
    };
  }

  if (version === 'v3') {
    const kind = dex === 'camelot' ? 3 : 1;

    return {
      ...base,
      kind,
      router: ZERO,
      path: [],
      pool: pool.poolAddress,
      tokenIn,
      tokenOut,
    };
  }

  throw new Error(`Unsupported pool version: ${pool.version}`);
}

