import { ethers } from "hardhat";
import {
  poolConfigsToStoreSteps,
  type PoolConfig,
} from "../../test/SwapStepsConfigReader/helpers/poolConfigToStoreSteps";
import { OptimismPoolsConfigListStabs } from "../../test/SwapStepsConfigStore/helpers/optimism/optimismPoolsConfigList.stabs";

type OptimismStabsConfig = {
  token0: string;
  token1: string;
  opts?: {
    tokenIn?: { decimals?: number; symbol?: string };
    tokenOut?: { decimals?: number; symbol?: string };
  };
  pairsToQuote: Array<{
    dex: string;
    version: string;
    poolAddress: string;
    feePpm?: number;
  }>;
};

function toPoolConfigs(raw: OptimismStabsConfig): PoolConfig[] {
  return raw.pairsToQuote.map((p) => ({
    dex: p.dex,
    version: p.version,
    poolAddress: p.poolAddress,
    feePpm: p.feePpm,
    tokenIn: { address: raw.token0 },
    tokenOut: { address: raw.token1 },
  }));
}

async function main() {
  const quoterAddress =
    process.env.OPTIMISM_QUOTER_ADDRESS || process.env.QUOTER_ADDRESS;

  if (!quoterAddress) {
    throw new Error("Missing OPTIMISM_QUOTER_ADDRESS or QUOTER_ADDRESS in .env");
  }

  const cfg = OptimismPoolsConfigListStabs as OptimismStabsConfig;
  const inDecimals = cfg.opts?.tokenIn?.decimals ?? 6;
  const outDecimals = cfg.opts?.tokenOut?.decimals ?? 18;
  const inSymbol = cfg.opts?.tokenIn?.symbol ?? "tokenIn";
  const outSymbol = cfg.opts?.tokenOut?.symbol ?? "tokenOut";

  const amountInHuman = process.env.AMOUNT_IN || "10";
  const amountIn = ethers.parseUnits(amountInHuman, inDecimals);

  const poolConfigs = toPoolConfigs(cfg);
  const steps = poolConfigsToStoreSteps(poolConfigs);

  const quoter = await ethers.getContractAt("ArbQuoter", quoterAddress);

  console.log("===========================================");
  console.log("ArbQuoter deployed quote test (Optimism)");
  console.log("===========================================");
  console.log("Quoter:", quoterAddress);
  console.log("Direction:", `${cfg.token0} -> ${cfg.token1}`);
  console.log("Amount in:", `${amountInHuman} ${inSymbol}`);

  const table: Array<{
    idx: number;
    dex: string;
    version: string;
    pool: string;
    amountOut: string;
    priceOutPerIn: string;
    success: boolean;
  }> = [];

  let successCount = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const meta = poolConfigs[i];

    const [amountOut, success] = await quoter.quoteExactIn.staticCall(step, amountIn);

    if (success) successCount++;

    const amountOutHuman = Number(ethers.formatUnits(amountOut, outDecimals));
    const amountInNum = Number(amountInHuman);
    const price = amountInNum > 0 ? (amountOutHuman / amountInNum) : 0;

    table.push({
      idx: i,
      dex: meta.dex,
      version: meta.version,
      pool: meta.poolAddress,
      amountOut: `${ethers.formatUnits(amountOut, outDecimals)} ${outSymbol}`,
      priceOutPerIn: `${price.toFixed(6)} ${outSymbol}/${inSymbol}`,
      success,
    });
  }

  console.table(table);
  console.log(`Success: ${successCount}/${steps.length}`);
}

main().catch((e) => {
  console.error("Quote script failed:", e);
  process.exitCode = 1;
});

