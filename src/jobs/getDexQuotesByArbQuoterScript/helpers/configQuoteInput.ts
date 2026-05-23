import { ethers } from "ethers";

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
};

const V2_ROUTERS_DEFAULT: Record<string, string> = {
  uniswap: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  sushi: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  camelot: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d",
  pancake: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
};

const NETWORK_PREFIX: Record<string, string> = {
  arbitrum: "ARBITRUM",
  optimism: "OPTIMISM",
  base: "BASE",
  blast: "BLAST",
  linea: "LINEA",
};

function activeNetworkName(): string {
  return (
    process.env.FORK_NETWORK
    || process.env.HARDHAT_NETWORK
    || process.env.npm_config_network
    || "hardhat"
  ).toLowerCase();
}

function v2RouterEnvBaseKey(dex: string): string | undefined {
  if (dex === "uniswap") return "UNISWAP_V2_ROUTER";
  if (dex === "sushi") return "SUSHISWAP_V2_ROUTER";
  if (dex === "camelot") return "CAMELOT_V2_ROUTER";
  if (dex === "pancake") return "PANCAKESWAP_V2_ROUTER";
  return undefined;
}

function resolveV2Router(dex: string): string {
  const baseKey = v2RouterEnvBaseKey(dex);
  const prefix = NETWORK_PREFIX[activeNetworkName()];

  if (baseKey && prefix) {
    const prefixed = process.env[`${prefix}_${baseKey}`];
    if (prefixed) return ethers.getAddress(prefixed);
  }

  if (baseKey) {
    const generic = process.env[baseKey];
    if (generic) return ethers.getAddress(generic);
  }

  const fallback = V2_ROUTERS_DEFAULT[dex];
  if (!fallback) {
    throw new Error(`Missing V2 router for dex=${dex} on network=${activeNetworkName()}`);
  }

  return ethers.getAddress(fallback);
}

function getTokenAddresses(config: DeployedImpactQuoteStabsConfig) {
  const tokenIn = config.token0 ?? config.opts?.tokenIn?.address;
  const tokenOut = config.token1 ?? config.opts?.tokenOut?.address;

  if (!tokenIn || !tokenOut) {
    throw new Error("Missing token addresses in stabs config (token0/token1 or opts.tokenIn/out.address)");
  }

  return {
    tokenIn: ethers.getAddress(tokenIn),
    tokenOut: ethers.getAddress(tokenOut),
  };
}

function parseOptionalPositiveUnits(value: string | undefined, decimals: number) {
  if (value === undefined) return { hasValue: false, parsed: 0n };
  const parsed = ethers.parseUnits(value, decimals);
  return { hasValue: parsed > 0n, parsed };
}

function referenceAmount(amount: bigint, referenceDivisor: bigint): bigint {
  if (amount === 0n) return 0n;
  const ref = amount / referenceDivisor;
  return ref === 0n ? 1n : ref;
}

export function configPairToInput(pair: DeployedImpactQuoteStabsConfig["pairsToQuote"][number]): ConfigPairInput {
  const ZERO = ethers.ZeroAddress;
  const dex = pair.dex.toLowerCase();
  const version = pair.version.toLowerCase();
  const pool = ethers.getAddress(pair.poolAddress);

  if (version === "v2") {
    return {
      kind: dex === "camelot" ? 2 : 0,
      router: resolveV2Router(dex),
      pool,
      v4Fee: 0,
      v4TickSpacing: 0,
      v4Hooks: ZERO,
    };
  }

  if (version === "v3") {
    return {
      kind: dex === "camelot" ? 3 : 1,
      router: ZERO,
      pool,
      v4Fee: 0,
      v4TickSpacing: 0,
      v4Hooks: ZERO,
    };
  }

  if (version === "v4") {
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
): { quoteInput: ConfigQuoteInput; poolMetas: PoolQuoteMeta[] } {
  if (options.referenceDivisor <= 0n) {
    throw new Error("REFERENCE_DIVISOR must be > 0");
  }

  const { tokenIn, tokenOut } = getTokenAddresses(config);
  const inDecimals = config.opts?.tokenIn?.decimals ?? 18;
  const outDecimals = config.opts?.tokenOut?.decimals ?? 18;

  const amountIn = ethers.parseUnits(options.amountInHuman, inDecimals);
  const { hasValue: hasAmountOut, parsed: amountOut } = parseOptionalPositiveUnits(
    options.amountOutHuman,
    outDecimals,
  );

  const pairs = config.pairsToQuote.map(configPairToInput);
  const poolMetas = config.pairsToQuote.map((p) => ({
    dex: p.dex,
    version: p.version,
    poolAddress: p.poolAddress,
    feePpm: p.feePpm,
  }));

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
      referenceAmountOut: hasAmountOut ? referenceAmount(amountOut, options.referenceDivisor) : 0n,
      pairs,
    },
    poolMetas,
  };
}

