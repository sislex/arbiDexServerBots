import { ethers } from 'ethers';

export type DeployedImpactQuoteStabsConfig = {
  rpcUrl: string;
  token0?: string;
  token1?: string;
  opts?: {
    tokenIn?: { address?: string; decimals?: number; symbol?: string };
    tokenOut?: { address?: string; decimals?: number; symbol?: string };
  };
  extraSettings?: {
    amountIn?: number | number[];
    amountOut?: number;
    referenceDivisor?: number;
  };
  pairsToQuote: Array<{
    dex: string;
    version: string;
    poolAddress: string;
    feePpm?: number;
    v4Fee?: number;
    v4TickSpacing?: number;
    v4Hooks?: string;
  }>;
};

export type PoolQuoteMeta = {
  dex: string;
  version: string;
  poolAddress: string;
  feePpm?: number;
};

export type ConfigPairInput = {
  kind: number;
  router: string;
  pool: string;
  v4Fee: number;
  v4TickSpacing: number;
  v4Hooks: string;
};

export type ConfigQuoteInput = {
  tokenIn: string;
  tokenOut: string;
  tokenInDecimals: number;
  tokenOutDecimals: number;
  amountIn: bigint;
  referenceAmountIn: bigint;
  hasAmountOut: boolean;
  amountOut: bigint;
  referenceAmountOut: bigint;
  pairs: ConfigPairInput[];
};

type BuildConfigQuoteInputOptions = {
  amountInHuman: string;
  amountOutHuman?: string;
  referenceDivisor: bigint;
  /** e.g. ARBITRUM / OPTIMISM / BASE / BLAST / LINEA from job source */
  networkEnvPrefix?: string;
};

type NetworkKey = 'arbitrum' | 'optimism' | 'base' | 'blast' | 'linea';

/**
 * UniV2-compatible (or used-as-v2) routers keyed by network + dex.
 * Addresses are lowercase; ethers.getAddress checksums them.
 */
const V2_ROUTERS_BY_NETWORK: Record<NetworkKey, Record<string, string>> = {
  arbitrum: {
    uniswap: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
    sushi: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
    camelot: '0xc873fecbd354f5a56e00e710b90ef4201db2448d',
    pancake: '0x8cfe327cec66d1c090dd72bd0ff11d690c33a2eb',
  },
  optimism: {
    uniswap: '0x4a7b5da61326a6379179b40d00f57e5bbdc962c2',
    sushi: '0x2abf469074dc0b54d793850807e6eb5faf675aee',
    velodrome: '0xa062ae8a9c5e11aaa026fc2670b0d65ccc8b2858',
  },
  base: {
    uniswap: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
    sushi: '0x6bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891',
    aerodrome: '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43',
    quickswap: '0x4a012af2b05616fb390ed32452641c3f04633bb5',
  },
  blast: {
    uniswap: '0xbb66eb1c5e875933d44dae661dbd80e5d9b03035',
    blaster: '0xc972fae6b524e8a6e0af21875675bf58a3133e60',
    thruster: '0x98994a9a7a2570367554589189dc9772241650f6',
    monoswap: '0x859374ea6df8289d883fed4e688a83381276521d',
  },
  linea: {
    // SyncSwap Classic router (getAmountsOut-compatible path is limited;
    // address still required for v2 pair wiring).
    syncswap: '0x80e38291e06339d10aab483c65695d004dbd5c69',
    echodex: '0x7aa004b0b968bdba10463bcc47a6c0ef0ded7056',
  },
};

/** Dex-only fallback when network is unknown (e.g. hardhat without prefix). */
const V2_ROUTERS_FALLBACK: Record<string, string> = {
  uniswap: V2_ROUTERS_BY_NETWORK.arbitrum.uniswap,
  sushi: V2_ROUTERS_BY_NETWORK.arbitrum.sushi,
  camelot: V2_ROUTERS_BY_NETWORK.arbitrum.camelot,
  pancake: V2_ROUTERS_BY_NETWORK.arbitrum.pancake,
  velodrome: V2_ROUTERS_BY_NETWORK.optimism.velodrome,
  aerodrome: V2_ROUTERS_BY_NETWORK.base.aerodrome,
  blaster: V2_ROUTERS_BY_NETWORK.blast.blaster,
  thruster: V2_ROUTERS_BY_NETWORK.blast.thruster,
  monoswap: V2_ROUTERS_BY_NETWORK.blast.monoswap,
  syncswap: V2_ROUTERS_BY_NETWORK.linea.syncswap,
  echodex: V2_ROUTERS_BY_NETWORK.linea.echodex,
  quickswap: V2_ROUTERS_BY_NETWORK.base.quickswap,
  // Scroll Solidly forks (not in job source networks yet)
  nile: '0xaaa3b69b90c9b2115b45c0107e6ca941858128a7',
  nuri: '0xaaa3b69b90c9b2115b45c0107e6ca941858128a7',
};

const NETWORK_PREFIX_TO_KEY: Record<string, NetworkKey> = {
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism',
  BASE: 'base',
  BLAST: 'blast',
  LINEA: 'linea',
};

const NETWORK_NAME_TO_KEY: Record<string, NetworkKey> = {
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  base: 'base',
  blast: 'blast',
  linea: 'linea',
};

function activeNetworkName(): string {
  return (
    process.env.FORK_NETWORK ||
    process.env.HARDHAT_NETWORK ||
    process.env.npm_config_network ||
    'hardhat'
  ).toLowerCase();
}

function resolveNetworkKey(networkEnvPrefix?: string): NetworkKey | undefined {
  if (networkEnvPrefix) {
    const fromPrefix = NETWORK_PREFIX_TO_KEY[networkEnvPrefix.toUpperCase()];
    if (fromPrefix) return fromPrefix;
  }

  return NETWORK_NAME_TO_KEY[activeNetworkName()];
}

function v2RouterEnvBaseKey(dex: string): string | undefined {
  const map: Record<string, string> = {
    uniswap: 'UNISWAP_V2_ROUTER',
    sushi: 'SUSHISWAP_V2_ROUTER',
    camelot: 'CAMELOT_V2_ROUTER',
    pancake: 'PANCAKESWAP_V2_ROUTER',
    velodrome: 'VELODROME_V2_ROUTER',
    aerodrome: 'AERODROME_V2_ROUTER',
    blaster: 'BLASTER_V2_ROUTER',
    thruster: 'THRUSTER_V2_ROUTER',
    monoswap: 'MONOSWAP_V2_ROUTER',
    syncswap: 'SYNCSWAP_V2_ROUTER',
    echodex: 'ECHODEX_V2_ROUTER',
    quickswap: 'QUICKSWAP_V2_ROUTER',
    nile: 'NILE_V2_ROUTER',
    nuri: 'NURI_V2_ROUTER',
  };
  return map[dex];
}

function resolveV2Router(dex: string, networkEnvPrefix?: string): string {
  const baseKey = v2RouterEnvBaseKey(dex);
  const networkKey = resolveNetworkKey(networkEnvPrefix);
  const prefix =
    networkEnvPrefix?.toUpperCase() ||
    (networkKey ? networkKey.toUpperCase() : undefined);

  if (baseKey && prefix) {
    const prefixed = process.env[`${prefix}_${baseKey}`];
    if (prefixed) return ethers.getAddress(prefixed);
  }

  if (baseKey) {
    const generic = process.env[baseKey];
    if (generic) return ethers.getAddress(generic);
  }

  const fromNetwork = networkKey
    ? V2_ROUTERS_BY_NETWORK[networkKey]?.[dex]
    : undefined;
  if (fromNetwork) return ethers.getAddress(fromNetwork);

  const fallback = V2_ROUTERS_FALLBACK[dex];
  if (fallback) return ethers.getAddress(fallback);

  throw new Error(
    `Missing V2 router for dex=${dex} on network=${networkKey ?? activeNetworkName()}` +
      (networkEnvPrefix ? ` (prefix=${networkEnvPrefix})` : ''),
  );
}

function getTokenAddresses(config: DeployedImpactQuoteStabsConfig) {
  const tokenIn = config.token0 ?? config.opts?.tokenIn?.address;
  const tokenOut = config.token1 ?? config.opts?.tokenOut?.address;

  if (!tokenIn || !tokenOut) {
    throw new Error(
      'Missing token addresses in stabs config (token0/token1 or opts.tokenIn/out.address)',
    );
  }

  return {
    tokenIn: ethers.getAddress(tokenIn),
    tokenOut: ethers.getAddress(tokenOut),
  };
}

function parseOptionalPositiveUnits(
  value: string | undefined,
  decimals: number,
) {
  if (value === undefined) return { hasValue: false, parsed: 0n };
  const parsed = ethers.parseUnits(value, decimals);
  return { hasValue: parsed > 0n, parsed };
}

function referenceAmount(amount: bigint, referenceDivisor: bigint): bigint {
  if (amount === 0n) return 0n;
  const ref = amount / referenceDivisor;
  return ref === 0n ? 1n : ref;
}

/** Camelot V2-style router (kind 2). */
const CAMELOT_V2_DEXES = new Set(['camelot']);

/**
 * Algebra / Camelot-V3 pool swap interface (kind=3).
 * HorizonDEX / Metavault are Algebra forks; Camelot V3 too.
 */
const ALGEBRA_V3_DEXES = new Set([
  'camelot',
  'horizondex',
  'horizon',
  'metavault',
]);

/**
 * Solidly forks: router has getAmountOut(amount, tokenIn, tokenOut), NOT UniV2
 * getAmountsOut(amount, path). ArbQuoter kind=0 will revert on these.
 */
const SOLIDLY_V2_DEXES = new Set([
  'velodrome',
  'aerodrome',
  'nile',
  'nuri',
  'hydrex',
]);

/** SyncSwap / iZi are not UniV2 getAmountsOut-compatible. */
const NON_UNIV2_ROUTER_DEXES = new Set(['syncswap', 'iziswap', 'izi']);

function unsupportedV2Reason(dex: string): string | undefined {
  if (SOLIDLY_V2_DEXES.has(dex)) {
    return `dex=${dex} v2 is Solidly-style (no UniV2 getAmountsOut); ArbQuoter kind=0 unsupported`;
  }
  if (NON_UNIV2_ROUTER_DEXES.has(dex)) {
    return `dex=${dex} v2 is not UniV2-router compatible; ArbQuoter kind=0 unsupported`;
  }
  return undefined;
}

export function configPairToInput(
  pair: DeployedImpactQuoteStabsConfig['pairsToQuote'][number],
  networkEnvPrefix?: string,
): ConfigPairInput {
  const ZERO = ethers.ZeroAddress;
  const dex = pair.dex.toLowerCase();
  const version = pair.version.toLowerCase();
  const pool = ethers.getAddress(pair.poolAddress);

  if (version === 'v2') {
    const unsupported = unsupportedV2Reason(dex);
    if (unsupported) {
      throw new Error(unsupported);
    }

    return {
      kind: CAMELOT_V2_DEXES.has(dex) ? 2 : 0,
      router: resolveV2Router(dex, networkEnvPrefix),
      pool,
      v4Fee: 0,
      v4TickSpacing: 0,
      v4Hooks: ZERO,
    };
  }

  if (version === 'v3') {
    return {
      kind: ALGEBRA_V3_DEXES.has(dex) ? 3 : 1,
      router: ZERO,
      pool,
      v4Fee: 0,
      v4TickSpacing: 0,
      v4Hooks: ZERO,
    };
  }

  if (version === 'v4') {
    return {
      kind: 4,
      router: ZERO,
      pool,
      v4Fee: pair.v4Fee ?? pair.feePpm ?? 0,
      v4TickSpacing: pair.v4TickSpacing ?? 0,
      v4Hooks: pair.v4Hooks ? ethers.getAddress(pair.v4Hooks) : ZERO,
    };
  }

  throw new Error(`Unknown pool version: ${pair.version}`);
}

export function stabsConfigToQuoteInput(
  config: DeployedImpactQuoteStabsConfig,
  options: BuildConfigQuoteInputOptions,
): {
  quoteInput: ConfigQuoteInput;
  poolMetas: PoolQuoteMeta[];
  skippedPairs: string[];
} {
  if (options.referenceDivisor <= 0n) {
    throw new Error('REFERENCE_DIVISOR must be > 0');
  }

  const { tokenIn, tokenOut } = getTokenAddresses(config);
  const inDecimals = config.opts?.tokenIn?.decimals ?? 18;
  const outDecimals = config.opts?.tokenOut?.decimals ?? 18;

  const amountIn = ethers.parseUnits(options.amountInHuman, inDecimals);
  const { hasValue: hasAmountOut, parsed: amountOut } =
    parseOptionalPositiveUnits(options.amountOutHuman, outDecimals);

  const pairs: ConfigPairInput[] = [];
  const poolMetas: PoolQuoteMeta[] = [];
  const skippedPairs: string[] = [];

  for (const pair of config.pairsToQuote) {
    const dex = pair.dex.toLowerCase();
    const version = pair.version.toLowerCase();
    if (version === 'v2') {
      const reason = unsupportedV2Reason(dex);
      if (reason) {
        skippedPairs.push(`${pair.poolAddress}: ${reason}`);
        continue;
      }
    }

    try {
      pairs.push(configPairToInput(pair, options.networkEnvPrefix));
      poolMetas.push({
        dex: pair.dex,
        version: pair.version,
        poolAddress: pair.poolAddress,
        feePpm: pair.feePpm,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      skippedPairs.push(`${pair.poolAddress}: ${msg}`);
    }
  }

  if (!pairs.length) {
    throw new Error(
      `No quotable pairs left after filtering unsupported DEX pools` +
        (skippedPairs.length ? `: ${skippedPairs.slice(0, 5).join('; ')}` : ''),
    );
  }

  return {
    quoteInput: {
      tokenIn,
      tokenOut,
      tokenInDecimals: inDecimals,
      tokenOutDecimals: outDecimals,
      amountIn,
      referenceAmountIn: referenceAmount(amountIn, options.referenceDivisor),
      hasAmountOut,
      amountOut,
      referenceAmountOut: hasAmountOut
        ? referenceAmount(amountOut, options.referenceDivisor)
        : 0n,
      pairs,
    },
    poolMetas,
    skippedPairs,
  };
}
