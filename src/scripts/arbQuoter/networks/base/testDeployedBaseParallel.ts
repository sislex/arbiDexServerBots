import * as dotenv from "dotenv";
import { ethers } from "ethers";
import ArbQuoterArtifact from "../../../../artifacts/contracts/ArbQuoter.sol/ArbQuoter.json";
import { BasePoolsConfigListStabs } from "./basePoolsConfigList.stabs";

dotenv.config();

type StabsConfig = {
  token0?: string;
  token1?: string;
  opts?: {
    tokenIn?: { address?: string; decimals?: number; symbol?: string };
    tokenOut?: { address?: string; decimals?: number; symbol?: string };
  };
  extraSettings?: {
    amountIn?: number;
  };
  pairsToQuote: Array<{
    dex: string;
    version: string;
    poolAddress: string;
    feePpm?: number;
  }>;
};

type PoolConfig = {
  dex: string;
  version: string;
  poolAddress: string;
  feePpm?: number;
  tokenIn: { address: string };
  tokenOut: { address: string };
};

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

const IMPACT_FN =
  "quoteExactInWithImpact((uint8,address,address[],address,address,address,uint24,int24,address),uint256,uint256)";

function parseAmountList(defaultAmountIn: number): string[] {
  const raw = process.env.AMOUNTS_IN ?? process.env.AMOUNT_IN ?? String(defaultAmountIn);
  const amounts = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (!amounts.length) {
    throw new Error("AMOUNTS_IN/AMOUNT_IN must contain at least one amount");
  }

  return amounts;
}

function formatUnitsFixed(value: bigint, decimals: number, precision = 6): string {
  const num = Number(ethers.formatUnits(value, decimals));
  if (!Number.isFinite(num)) return ethers.formatUnits(value, decimals);
  if (num === 0) return "0";
  if (Math.abs(num) < 0.000001) return num.toExponential(4);
  return num.toFixed(precision);
}

function formatRatio(numerator: bigint, numeratorDecimals: number, denominatorHuman: string, precision = 6): string {
  const num = Number(ethers.formatUnits(numerator, numeratorDecimals));
  const den = Number(denominatorHuman);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return "n/a";
  const ratio = num / den;
  if (ratio === 0) return "0";
  if (Math.abs(ratio) < 0.000001) return ratio.toExponential(4);
  return ratio.toFixed(precision);
}

function impactLevel(priceImpactPpm: bigint): string {
  const ppm = Number(priceImpactPpm);
  if (ppm >= 100_000) return "CRITICAL >10%";
  if (ppm >= 50_000) return "VERY_HIGH <=10%";
  if (ppm >= 10_000) return "HIGH <=5%";
  if (ppm >= 3_000) return "MEDIUM <=1%";
  if (ppm >= 1_000) return "LOW <=0.3%";
  return "OK <0.1%";
}

function toPoolConfigs(raw: StabsConfig): PoolConfig[] {
  const tokenIn = raw.token0 ?? raw.opts?.tokenIn?.address;
  const tokenOut = raw.token1 ?? raw.opts?.tokenOut?.address;

  if (!tokenIn || !tokenOut) {
    throw new Error("Missing token addresses in stabs config (token0/token1 or opts.tokenIn/out.address)");
  }

  return raw.pairsToQuote.map((p) => ({
    dex: p.dex,
    version: p.version,
    poolAddress: p.poolAddress,
    feePpm: p.feePpm,
    tokenIn: { address: tokenIn },
    tokenOut: { address: tokenOut },
  }));
}

function resolveBaseV2Router(dex: string): string | undefined {
  if (dex === "uniswap") {
    return process.env.BASE_UNISWAP_V2_ROUTER
      ?? process.env.UNISWAP_V2_ROUTER
      ?? "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";
  }

  if (dex === "sushi") {
    return process.env.BASE_SUSHISWAP_V2_ROUTER
      ?? process.env.SUSHISWAP_V2_ROUTER
      ?? "0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891";
  }

  if (dex === "camelot") {
    return process.env.BASE_CAMELOT_V2_ROUTER ?? process.env.CAMELOT_V2_ROUTER;
  }

  return undefined;
}

function poolConfigsToStoreSteps(cfgs: PoolConfig[]): StoreSwapStep[] {
  const zero = ethers.ZeroAddress;

  return cfgs.map((cfg) => {
    const base = {
      v4Fee: 0,
      v4TickSpacing: 0,
      v4Hooks: zero,
    };

    if (cfg.version === "v2") {
      const router = resolveBaseV2Router(cfg.dex);
      if (!router) {
        throw new Error(`Missing Base V2 router for dex=${cfg.dex}`);
      }

      return {
        ...base,
        kind: cfg.dex === "camelot" ? 2 : 0,
        router,
        path: [cfg.tokenIn.address, cfg.tokenOut.address],
        pool: zero,
        tokenIn: cfg.tokenIn.address,
        tokenOut: cfg.tokenOut.address,
      };
    }

    if (cfg.version === "v3") {
      return {
        ...base,
        kind: cfg.dex === "camelot" ? 3 : 1,
        router: zero,
        path: [],
        pool: cfg.poolAddress,
        tokenIn: cfg.tokenIn.address,
        tokenOut: cfg.tokenOut.address,
      };
    }

    if (cfg.version === "v4") {
      return {
        kind: 4,
        router: zero,
        path: [],
        pool: cfg.poolAddress ?? zero,
        tokenIn: cfg.tokenIn.address,
        tokenOut: cfg.tokenOut.address,
        v4Fee: (cfg as any).v4Fee ?? 0,
        v4TickSpacing: (cfg as any).v4TickSpacing ?? 0,
        v4Hooks: (cfg as any).v4Hooks ?? zero,
      };
    }

    throw new Error(`Unknown version: ${cfg.version}`);
  });
}

async function main() {
  const baseRpc = process.env.BASE_RPC || "https://mainnet.base.org";
  const quoterAddress = process.env.BASE_QUOTER_ADDRESS || process.env.QUOTER_ADDRESS;
  if (!quoterAddress) {
    throw new Error("Missing BASE_QUOTER_ADDRESS or QUOTER_ADDRESS in .env");
  }

  const cfg = BasePoolsConfigListStabs as StabsConfig;
  const inDecimals = cfg.opts?.tokenIn?.decimals ?? 6;
  const outDecimals = cfg.opts?.tokenOut?.decimals ?? 18;
  const inSymbol = cfg.opts?.tokenIn?.symbol ?? "tokenIn";
  const outSymbol = cfg.opts?.tokenOut?.symbol ?? "tokenOut";

  const configAmountIn = cfg.extraSettings?.amountIn;
  if (configAmountIn === undefined) {
    throw new Error("Missing extraSettings.amountIn in BasePoolsConfigListStabs");
  }

  const amountInHumans = parseAmountList(configAmountIn);
  const referenceDivisor = BigInt(process.env.REFERENCE_DIVISOR ?? "100");
  if (referenceDivisor <= 0n) {
    throw new Error("REFERENCE_DIVISOR must be > 0");
  }

  const poolConfigs = toPoolConfigs(cfg);
  const steps = poolConfigsToStoreSteps(poolConfigs);
  const provider = new ethers.JsonRpcProvider(baseRpc, 8453, { batchMaxCount: 1 });
  const quoter = new ethers.Contract(quoterAddress, ArbQuoterArtifact.abi, provider);
  const quoteExactInFn = quoter.getFunction("quoteExactIn");
  const impactFn = quoter.getFunction(IMPACT_FN);
  const blockTag = await provider.getBlockNumber();

  console.log("====================================================");
  console.log("ArbQuoter parallel quoteExactIn + impact test (Base)");
  console.log("====================================================");
  console.log("Quoter:", quoterAddress);
  console.log("Block tag:", blockTag);
  console.log("Amounts in:", amountInHumans.map((x) => `${x} ${inSymbol}`).join(", "));
  console.log("Reference divisor:", referenceDivisor.toString(), "(referenceAmountIn = amountIn / divisor, min 1 wei)");

  const tasks = amountInHumans.flatMap((amountInHuman) => {
    const amountIn = ethers.parseUnits(amountInHuman, inDecimals);
    const referenceAmountIn = amountIn / referenceDivisor || 1n;

    return steps.map(async (step, i) => {
      const meta = poolConfigs[i];

      const [exactSettled, impactSettled] = await Promise.allSettled([
        quoteExactInFn.staticCall(step, amountIn, { blockTag }) as Promise<[bigint, boolean]>,
        impactFn.staticCall(step, amountIn, referenceAmountIn, { blockTag }) as Promise<{
            amountOut: bigint;
            outPerInX18: bigint;
            referenceOutPerInX18: bigint;
            priceImpactPpm: bigint;
            sellAmountOut: bigint;
            canTradeAmountIn: boolean;
            success: boolean;
        }>,
      ]);

      let exactAmountOut = 0n;
      let exactSuccess = false;
      let exactRevertHint = "";

      if (exactSettled.status === "fulfilled") {
        [exactAmountOut, exactSuccess] = exactSettled.value;
      } else {
        const msg = exactSettled.reason instanceof Error ? exactSettled.reason.message : String(exactSettled.reason);
        exactRevertHint = msg.slice(0, 140);
      }

      let impactAmountOut = 0n;
      let impactPriceImpactPpm = 0n;
      let impactSellAmountOut = 0n;
      let impactSuccess = false;
      let canTradeAmountIn = false;
      let impactRevertHint = "";

      if (impactSettled.status === "fulfilled") {
        impactAmountOut = impactSettled.value.amountOut;
        impactPriceImpactPpm = impactSettled.value.priceImpactPpm;
        impactSellAmountOut = impactSettled.value.sellAmountOut;
        impactSuccess = impactSettled.value.success;
        canTradeAmountIn = impactSettled.value.canTradeAmountIn;
      } else {
        const msg = impactSettled.reason instanceof Error ? impactSettled.reason.message : String(impactSettled.reason);
        impactRevertHint = msg.slice(0, 140);
      }

      const sameAmountOut = exactSettled.status === "fulfilled"
        && impactSettled.status === "fulfilled"
        && exactAmountOut === impactAmountOut;

      return {
        exactRow: {
          dex: meta.dex,
          version: meta.version,
          pool: meta.poolAddress,
          exactAmountOut: `${formatUnitsFixed(exactAmountOut, outDecimals)} ${outSymbol}`,
          exactSuccess,
          revertHint: exactRevertHint,
        },
        impactRow: {
          dex: meta.dex,
          version: meta.version,
          pool: meta.poolAddress,
          impactAmountOut: `${formatUnitsFixed(impactAmountOut, outDecimals)} ${outSymbol}`,
          sameAmountOut,
          sellAmountOut: `${formatUnitsFixed(impactSellAmountOut, outDecimals)} ${outSymbol}`,
          priceOutPerIn: formatRatio(impactAmountOut, outDecimals, amountInHuman),
          sellPriceOutPerIn: formatRatio(impactSellAmountOut, outDecimals, amountInHuman),
          priceImpactPpm: impactPriceImpactPpm.toString(),
          impactLevel: impactSettled.status === "fulfilled" ? impactLevel(impactPriceImpactPpm) : "REVERT",
          impactSuccess,
          canTradeAmountIn,
          revertHint: impactRevertHint,
        },
        compareRow: {
          dex: meta.dex,
          version: meta.version,
          pool: meta.poolAddress,
          sameAmountOut,
        },
      };
    });
  });

  const rows = await Promise.all(tasks);
  const exactRows = rows.map((row) => row.exactRow);
  const impactRows = rows.map((row) => row.impactRow);
  const compareRows = rows.map((row) => row.compareRow);

  const exactSuccessCount = exactRows.filter((row) => row.exactSuccess).length;
  const impactSuccessCount = impactRows.filter((row) => row.impactSuccess).length;
  const sameAmountOutCount = compareRows.filter((row) => row.sameAmountOut).length;

  console.log("\nquoteExactIn");
  console.table(exactRows);

  console.log("\nquoteExactInWithImpact");
  console.table(impactRows);

  console.log(`quoteExactIn success: ${exactSuccessCount}/${rows.length}`);
  console.log(`quoteExactInWithImpact success: ${impactSuccessCount}/${rows.length}`);
  console.log(`sameAmountOut: ${sameAmountOutCount}/${rows.length}`);
}

main().catch((e) => {
  console.error("Parallel quote script failed:", e);
  process.exitCode = 1;
});








