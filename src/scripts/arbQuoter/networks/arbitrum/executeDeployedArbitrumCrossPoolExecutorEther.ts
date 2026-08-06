// @ts-nocheck
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Contract, JsonRpcProvider, Wallet, ethers, type InterfaceAbi } from "ethers";
import {
  configPairToInput,
  stabsConfigToQuoteInput,
  type DeployedImpactQuoteStabsConfig,
} from "../helpers/configQuoteInput.ts";
import { ArbitrumPoolsConfigListStabs } from "./arbitrumPoolsConfigList.stabs.ts";

type Artifact = { abi: InterfaceAbi };

type QuoteItem = {
  buy: {
    success: boolean;
    amountOut: bigint;
  };
};

type QuoteResult = {
  quotes: QuoteItem[];
  blockNumber: bigint;
  gasUsed: bigint;
};

type Opportunity = {
  amountInHuman: string;
  amountInRaw: bigint;
  buyPoolIdx: number;
  buyAmountOutRaw: bigint;
  sellPoolIdx: number;
  sellAmountOutRaw: bigint;
  expectedProfitRaw: bigint;
};

type SkipReason =
  | "no_opportunity"
  | "expected_profit_non_positive"
  | "simulation_reverted"
  | "estimate_gas_reverted"
  | "simulation_profit_non_positive"
  | "gas_cost_not_convertible"
  | "net_profit_below_threshold"
  | "tx_send_failed";

const QUOTER_ENV_KEY = "ARBITRUM_QUOTER_ADDRESS";
const EXECUTOR_ENV_KEY = "ARBITRUM_EXECUTOR_ADDRESS";
const RPC_ENV_KEY = "ARBITRUM_RPC";
const PRIVATE_KEY_ENV_KEY = "PRIVATE_KEY";
const REFERENCE_DIVISOR = BigInt(ArbitrumPoolsConfigListStabs.extraSettings?.referenceDivisor ?? 100);
const DO_REAL_TRANSACTION = (process.env.ARBITRUM_EXECUTOR_REAL_TX ?? "true").toLowerCase() === "true";
const ARBITRUM_WETH = ethers.getAddress(process.env.ARBITRUM_WETH_ADDRESS ?? "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1");
const GAS_BUFFER_BPS = BigInt(process.env.ARBITRUM_EXECUTOR_GAS_BUFFER_BPS ?? "12000");
const MIN_NET_PROFIT_RAW = BigInt(process.env.ARBITRUM_MIN_NET_PROFIT_RAW ?? "0");

const config = ArbitrumPoolsConfigListStabs as DeployedImpactQuoteStabsConfig;
const tokenIn = ethers.getAddress(config.opts?.tokenIn?.address ?? "");
const tokenOut = ethers.getAddress(config.opts?.tokenOut?.address ?? "");
const tokenInDecimals = config.opts?.tokenIn?.decimals ?? 18;
const tokenOutDecimals = config.opts?.tokenOut?.decimals ?? 18;
const SKIP_STATS: Record<SkipReason, number> = {
  no_opportunity: 0,
  expected_profit_non_positive: 0,
  simulation_reverted: 0,
  estimate_gas_reverted: 0,
  simulation_profit_non_positive: 0,
  gas_cost_not_convertible: 0,
  net_profit_below_threshold: 0,
  tx_send_failed: 0,
};

function logSkip(reason: SkipReason, details?: string) {
  SKIP_STATS[reason] += 1;
  const tail = details ? ` | ${details}` : "";
  console.log(`[SKIP_REASON=${reason}]${tail}`);
  const stats = Object.entries(SKIP_STATS)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${key}:${count}`)
    .join(", ");
  if (stats) {
    console.log(`[SKIP_STATS] ${stats}`);
  }
}

function parsePositiveAmountIn(value: number | undefined, fallback: number, decimals: number): { human: string; raw: bigint } {
  const human = String(value ?? fallback).trim();
  const raw = ethers.parseUnits(human, decimals);
  if (raw <= 0n) {
    throw new Error("config.extraSettings.amountIn must be a positive number");
  }
  return { human, raw };
}

function formatSignedAmount(value: bigint, decimals: number): string {
  const sign = value < 0n ? "-" : "";
  const abs = value < 0n ? -value : value;
  return `${sign}${ethers.formatUnits(abs, decimals)}`;
}

function withBps(value: bigint, bps: bigint): bigint {
  return (value * bps + 9_999n) / 10_000n;
}

function resolveGasPriceWei(feeData: { gasPrice: bigint | null; maxFeePerGas: bigint | null }): bigint {
  if (feeData.gasPrice && feeData.gasPrice > 0n) return feeData.gasPrice;
  if (feeData.maxFeePerGas && feeData.maxFeePerGas > 0n) return feeData.maxFeePerGas;
  throw new Error("Cannot resolve gas price from fee data");
}

async function loadAbi(artifactRelativePath: string): Promise<InterfaceAbi> {
  const artifactPath = path.resolve(process.cwd(), artifactRelativePath);
  const raw = await readFile(artifactPath, "utf8");
  const artifact = JSON.parse(raw) as Artifact;
  if (!Array.isArray(artifact.abi) || artifact.abi.length === 0) {
    throw new Error(`Invalid ABI in artifact: ${artifactPath}`);
  }
  return artifact.abi;
}

function buildSwapStep(
  pair: (typeof config.pairsToQuote)[number],
  fromToken: string,
  toToken: string,
  amountIn: bigint,
  amountOutMin = 0n,
) {
  const pairInput = configPairToInput(pair, 'ARBITRUM');
  return {
    kind: pairInput.kind,
    router: pairInput.router,
    path: pair.version.toLowerCase() === "v2" ? [fromToken, toToken] : [],
    pool: pairInput.pool,
    tokenIn: fromToken,
    tokenOut: toToken,
    amountIn,
    amountOutMin,
    sqrtPriceLimitX96: 0n,
    deadline: 0n,
  };
}

async function findBestForwardQuote(quoter: Contract, amountInHuman: string) {
  const { quoteInput } = stabsConfigToQuoteInput(config, {
    amountInHuman,
    referenceDivisor: REFERENCE_DIVISOR,
    networkEnvPrefix: 'ARBITRUM',
  });

  const result = await quoter.quoteConfigExactInWithImpact.staticCall(quoteInput) as QuoteResult;

  let bestIdx = -1;
  let bestAmountOut = 0n;
  for (let i = 0; i < result.quotes.length; i++) {
    const q = result.quotes[i];
    if (q?.buy?.success && q.buy.amountOut > bestAmountOut) {
      bestAmountOut = q.buy.amountOut;
      bestIdx = i;
    }
  }

  return { bestIdx, bestAmountOut, result };
}

async function findBestReverseQuoteForBoughtAmount(quoter: Contract, boughtAmountOutRaw: bigint) {
  const reverseConfig: DeployedImpactQuoteStabsConfig = {
    rpcUrl: config.rpcUrl,
    opts: {
      tokenIn: config.opts?.tokenOut,
      tokenOut: config.opts?.tokenIn,
    },
    pairsToQuote: config.pairsToQuote,
    extraSettings: {
      referenceDivisor: Number(REFERENCE_DIVISOR),
    },
  };

  const reverseAmountInHuman = ethers.formatUnits(boughtAmountOutRaw, tokenOutDecimals);
  const { quoteInput } = stabsConfigToQuoteInput(reverseConfig, {
    amountInHuman: reverseAmountInHuman,
    referenceDivisor: REFERENCE_DIVISOR,
    networkEnvPrefix: 'ARBITRUM',
  });

  const result = await quoter.quoteConfigExactInWithImpact.staticCall(quoteInput) as QuoteResult;

  let bestIdx = -1;
  let bestAmountOut = 0n;
  for (let i = 0; i < result.quotes.length; i++) {
    const q = result.quotes[i];
    if (q?.buy?.success && q.buy.amountOut > bestAmountOut) {
      bestAmountOut = q.buy.amountOut;
      bestIdx = i;
    }
  }

  return { bestIdx, bestAmountOut, result, reverseAmountInHuman };
}

async function estimateGasCostInTokenInRaw(
  quoter: Contract,
  estimatedGasCostWei: bigint,
): Promise<bigint | null> {
  if (estimatedGasCostWei <= 0n) return 0n;

  // If profit token is WETH, gas is directly comparable.
  if (ethers.getAddress(tokenIn) === ARBITRUM_WETH) {
    return estimatedGasCostWei;
  }

  // For USDC->WETH->USDC cycles, convert WETH gas cost back to tokenIn via the same reverse quote path.
  if (ethers.getAddress(tokenOut) === ARBITRUM_WETH) {
    const reverse = await findBestReverseQuoteForBoughtAmount(quoter, estimatedGasCostWei);
    if (reverse.bestIdx >= 0 && reverse.bestAmountOut > 0n) {
      return reverse.bestAmountOut;
    }
  }

  return null;
}

async function selectBestOpportunity(quoter: Contract): Promise<Opportunity | null> {
  const amount = parsePositiveAmountIn(config.extraSettings?.amountIn, 0.01, tokenInDecimals);

  const forward = await findBestForwardQuote(quoter, amount.human);
  if (forward.bestIdx < 0 || forward.bestAmountOut <= 0n) {
    console.log(`Skip amount ${amount.human}: no successful buy quote`);
    return null;
  }

  const reverse = await findBestReverseQuoteForBoughtAmount(quoter, forward.bestAmountOut);
  if (reverse.bestIdx < 0 || reverse.bestAmountOut <= 0n) {
    console.log(`Skip amount ${amount.human}: no successful sell quote for bought amount`);
    return null;
  }

  return {
    amountInHuman: amount.human,
    amountInRaw: amount.raw,
    buyPoolIdx: forward.bestIdx,
    buyAmountOutRaw: forward.bestAmountOut,
    sellPoolIdx: reverse.bestIdx,
    sellAmountOutRaw: reverse.bestAmountOut,
    expectedProfitRaw: reverse.bestAmountOut - amount.raw,
  };
}

export async function runArbitrumCrossPoolArbExecutorOnce() {
  const rpcUrl = process.env[RPC_ENV_KEY] || config.rpcUrl;
  const quoterAddress = process.env[QUOTER_ENV_KEY];
  const executorAddress = process.env[EXECUTOR_ENV_KEY];
  const privateKey = process.env[PRIVATE_KEY_ENV_KEY];

  if (!rpcUrl) throw new Error(`Missing ${RPC_ENV_KEY}`);
  if (!quoterAddress) throw new Error(`Missing ${QUOTER_ENV_KEY}`);
  if (!executorAddress) throw new Error(`Missing ${EXECUTOR_ENV_KEY}`);
  if (!privateKey) throw new Error(`Missing ${PRIVATE_KEY_ENV_KEY}`);

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);

  const [quoterAbi, executorAbi] = await Promise.all([
    loadAbi("src/artifacts/contracts/ArbQuoter.sol/ArbQuoter.json"),
    loadAbi("src/artifacts/contracts/ArbExecutor.sol/ArbExecutor.json"),
  ]);

  const quoter = new Contract(ethers.getAddress(quoterAddress), quoterAbi, provider);
  const executor = new Contract(ethers.getAddress(executorAddress), executorAbi, signer);

  const [quoterCode, executorCode] = await Promise.all([
    provider.getCode(quoter.target as string),
    provider.getCode(executor.target as string),
  ]);
  if (quoterCode === "0x") throw new Error(`No contract at quoter ${String(quoter.target)}`);
  if (executorCode === "0x") throw new Error(`No contract at executor ${String(executor.target)}`);

  const caller = await signer.getAddress();
  const owner = await executor.owner() as string;
  if (ethers.getAddress(owner) !== ethers.getAddress(caller)) {
    throw new Error(`Caller ${caller} is not executor owner ${owner}. executeSwaps is onlyOwner.`);
  }

  const opportunity = await selectBestOpportunity(quoter);
  if (!opportunity) {
    logSkip("no_opportunity", "No valid opportunities found for configured amounts");
    return;
  }

  const buyPair = config.pairsToQuote[opportunity.buyPoolIdx];
  const sellPair = config.pairsToQuote[opportunity.sellPoolIdx];

  console.log("===========================================");
  console.log("Arbitrum cross-pool arb check");
  console.log("===========================================");
  console.log(`Amount in: ${opportunity.amountInHuman} ${config.opts?.tokenIn?.symbol}`);
  console.log(`Best buy pool: [${opportunity.buyPoolIdx}] ${buyPair.dex} ${buyPair.version} ${buyPair.poolAddress}`);
  console.log(`Best buy amount out: ${ethers.formatUnits(opportunity.buyAmountOutRaw, tokenOutDecimals)} ${config.opts?.tokenOut?.symbol}`);
  console.log(`Best sell pool: [${opportunity.sellPoolIdx}] ${sellPair.dex} ${sellPair.version} ${sellPair.poolAddress}`);
  console.log(`Best sell amount out: ${ethers.formatUnits(opportunity.sellAmountOutRaw, tokenInDecimals)} ${config.opts?.tokenIn?.symbol}`);
  console.log(`Expected profit: ${formatSignedAmount(opportunity.expectedProfitRaw, tokenInDecimals)} ${config.opts?.tokenIn?.symbol}`);

  if (opportunity.expectedProfitRaw <= 0n) {
    logSkip("expected_profit_non_positive", `expectedProfitRaw=${opportunity.expectedProfitRaw.toString()}`);
    return;
  }

  const buyStep = buildSwapStep(
    buyPair,
    tokenIn,
    tokenOut,
    opportunity.amountInRaw,
    0n,
  );
  const sellStep = buildSwapStep(
    sellPair,
    tokenOut,
    tokenIn,
    0n,
    0n,
  );

  let summary: { profit: bigint; totalGasUsed: bigint };
  let logs: Array<{ amountOut: bigint; amountIn: bigint }>;
  try {
    [summary, logs] = await executor.executeSwaps.staticCall(
      [buyStep, sellStep],
      tokenIn,
      false,
      false,
    ) as [{ profit: bigint; totalGasUsed: bigint }, Array<{ amountOut: bigint; amountIn: bigint }>];
  } catch (e: any) {
    logSkip("simulation_reverted", `reason=${e?.reason ?? e?.shortMessage ?? e?.message ?? "unknown"}`);
    return;
  }

  let estimatedGas: bigint;
  try {
    estimatedGas = await executor.executeSwaps.estimateGas(
      [buyStep, sellStep],
      tokenIn,
      true,
      true,
    ) as bigint;
  } catch (e: any) {
    logSkip("estimate_gas_reverted", `reason=${e?.reason ?? e?.shortMessage ?? e?.message ?? "unknown"}`);
    return;
  }
  const gasLimitForTx = withBps(estimatedGas, GAS_BUFFER_BPS);
  const feeData = await provider.getFeeData();
  const gasPriceWei = resolveGasPriceWei(feeData);
  const estimatedGasCostWei = gasLimitForTx * gasPriceWei;

  const estimatedGasCostInTokenInRaw = await estimateGasCostInTokenInRaw(quoter, estimatedGasCostWei);
  const gasComparable = estimatedGasCostInTokenInRaw !== null;
  const estimatedNetProfitRaw = gasComparable ? (summary.profit - estimatedGasCostInTokenInRaw) : null;

  console.log("-------------------------------------------");
  console.log("Execution pre-check (with gas)");
  console.log(`simulated profit: ${formatSignedAmount(summary.profit, tokenInDecimals)} ${config.opts?.tokenIn?.symbol}`);
  console.log(`estimated gas: ${estimatedGas.toString()} (tx gasLimit=${gasLimitForTx.toString()})`);
  console.log(`estimated gas price: ${ethers.formatUnits(gasPriceWei, "gwei")} gwei`);
  if (gasComparable) {
    console.log(`estimated gas cost: ${formatSignedAmount(estimatedGasCostInTokenInRaw!, tokenInDecimals)} ${config.opts?.tokenIn?.symbol}`);
    console.log(`estimated net profit: ${formatSignedAmount(estimatedNetProfitRaw!, tokenInDecimals)} ${config.opts?.tokenIn?.symbol}`);
  } else {
    console.log(
      `gas cost cannot be converted to profit token ${tokenIn}. Execution skipped for safety.`,
    );
  }

  if (summary.profit <= 0n) {
    logSkip("simulation_profit_non_positive", `summary.profit=${summary.profit.toString()}`);
    return;
  }

  if (!gasComparable) {
    logSkip("gas_cost_not_convertible", `tokenIn=${tokenIn}`);
    return;
  }

  if (estimatedNetProfitRaw! <= MIN_NET_PROFIT_RAW) {
    logSkip(
      "net_profit_below_threshold",
      `estimatedNetProfitRaw=${estimatedNetProfitRaw!.toString()}, threshold=${MIN_NET_PROFIT_RAW.toString()}`,
    );
    return;
  }

  if (DO_REAL_TRANSACTION) {
    let tx;
    try {
      tx = await executor.executeSwaps(
        [buyStep, sellStep],
        tokenIn,
        true,
        true,
        { gasLimit: gasLimitForTx },
      );
    } catch (e: any) {
      logSkip("tx_send_failed", `reason=${e?.reason ?? e?.shortMessage ?? e?.message ?? "unknown"}`);
      return;
    }

    const receipt = await tx.wait();
    if (!receipt) {
      logSkip("tx_send_failed", "receipt_is_null");
      return;
    }

    console.log("-------------------------------------------");
    console.log("Execution sent");
    console.log("tx:", tx.hash);
    console.log("gasUsed:", receipt.gasUsed.toString());
    console.log("status:", receipt.status);
    return;
  }

  console.log("-------------------------------------------");
  console.log("Static simulation result");
  console.log(`profit: ${formatSignedAmount(summary.profit, tokenInDecimals)} ${config.opts?.tokenIn?.symbol}`);
  console.log(`gasUsed: ${summary.totalGasUsed.toString()}`);
  console.log(`step1 in/out: ${logs[0]?.amountIn?.toString() ?? "0"} / ${logs[0]?.amountOut?.toString() ?? "0"}`);
  console.log(`step2 in/out: ${logs[1]?.amountIn?.toString() ?? "0"} / ${logs[1]?.amountOut?.toString() ?? "0"}`);
}

async function main() {
  await runArbitrumCrossPoolArbExecutorOnce();
}

main().catch((e) => {
  console.error("Cross-pool executor script failed:", e);
  process.exitCode = 1;
});






