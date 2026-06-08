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

type PoolExecutionResult = {
  status: "ok" | "failed" | "skipped";
  dex: string;
  version: string;
  pool: string;
  quotedOutOneUsdc: bigint;
  quotedOutFromConfigNormalized: bigint;
  quoteDiffPpm: bigint;
  actualOut: bigint;
  slippagePpm: bigint;
  gasUsed: bigint;
  txHash: string;
  reason?: string;
};

const QUOTER_ENV_KEY = "ARBITRUM_QUOTER_ADDRESS";
const EXECUTOR_ENV_KEY = "ARBITRUM_EXECUTOR_ADDRESS";
const RPC_ENV_KEY = "ARBITRUM_RPC";
const PRIVATE_KEY_ENV_KEY = "PRIVATE_KEY";
const AMOUNT_IN_USDC_HUMAN = process.env.ARBITRUM_EXECUTOR_AMOUNT_IN_USDC ?? "1";
const DO_REAL_TRANSACTION = false;

const config = ArbitrumPoolsConfigListStabs as DeployedImpactQuoteStabsConfig;

// This config defines tokenIn = USDC, tokenOut = WETH (direction: USDC -> WETH).
const tokenUsdc = ethers.getAddress(config.opts?.tokenIn?.address ?? "");
const tokenWeth = ethers.getAddress(config.opts?.tokenOut?.address ?? "");
const usdcDecimals = config.opts?.tokenIn?.decimals ?? 6;
const wethDecimals = config.opts?.tokenOut?.decimals ?? 18;
const amountInUsdc = ethers.parseUnits(AMOUNT_IN_USDC_HUMAN, usdcDecimals);
const AMOUNT_OUT_MIN_SLIPPAGE_BPS = BigInt(process.env.ARBITRUM_EXECUTOR_SLIPPAGE_BPS ?? "50");
const CONFIG_USDC_AMOUNT_HUMAN = String(config.extraSettings?.amountOut ?? "1");
const CONFIG_USDC_AMOUNT_NUM = Number(CONFIG_USDC_AMOUNT_HUMAN);

function signedSlippagePpm(quotedOut: bigint, actualOut: bigint): bigint {
  if (quotedOut === 0n) return 0n;
  return ((quotedOut - actualOut) * 1_000_000n) / quotedOut;
}

function ppmToPct(ppm: bigint): string {
  const pct = Number(ppm) / 10_000;
  return `${pct.toFixed(4)}%`;
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

function buildExecutorSwapStep(pair: (typeof config.pairsToQuote)[number], amountIn: bigint, amountOutMin: bigint = 0n) {
  const pairInput = configPairToInput(pair);
  return {
    kind: pairInput.kind,
    router: pairInput.router,
    path: pair.version.toLowerCase() === "v2" ? [tokenUsdc, tokenWeth] : [],
    pool: pairInput.pool,
    tokenIn: tokenUsdc,
    tokenOut: tokenWeth,
    amountIn,
    amountOutMin,
    sqrtPriceLimitX96: 0n,
    deadline: 0n,
  };
}

function getSwapStepExecutedAmountOut(executor: Contract, receipt: ethers.TransactionReceipt): bigint {
  for (const log of receipt.logs) {
    try {
      const parsed = executor.interface.parseLog(log);
      if (parsed && parsed.name === "SwapStepExecuted") {
        return parsed.args.amountOut as bigint;
      }
    } catch {
      // ignore logs from other contracts
    }
  }
  return 0n;
}

async function main() {
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
  const [owner, isAllowedCaller] = await Promise.all([
    executor.owner() as Promise<string>,
    executor.isAllowedCaller(caller) as Promise<boolean>,
  ]);
  if (ethers.getAddress(owner) !== ethers.getAddress(caller) && !isAllowedCaller) {
    throw new Error(`Caller ${caller} is not owner and not allowed caller`);
  }
  if (!Number.isFinite(CONFIG_USDC_AMOUNT_NUM) || CONFIG_USDC_AMOUNT_NUM <= 0) {
    throw new Error(`Invalid config amountOut: ${CONFIG_USDC_AMOUNT_HUMAN}`);
  }

  const quoteConfigOneUsdc: DeployedImpactQuoteStabsConfig = {
    opts: {
      tokenIn: config.opts?.tokenIn,
      tokenOut: config.opts?.tokenOut,
    },
    extraSettings: {
      amountIn: Number(AMOUNT_IN_USDC_HUMAN),
      referenceDivisor: config.extraSettings?.referenceDivisor ?? 100,
    },
    pairsToQuote: config.pairsToQuote,
    rpcUrl: config.rpcUrl,
  };

  const referenceDivisor = BigInt(config.extraSettings?.referenceDivisor ?? 100);
  const { quoteInput: quoteInputOneUsdc } = stabsConfigToQuoteInput(quoteConfigOneUsdc, {
    amountInHuman: AMOUNT_IN_USDC_HUMAN,
    referenceDivisor,
  });

  // Step 1: Run quoter for 1 USDC
  console.log("Step 1: Running quoter for 1 USDC...");
  const quoteResultOneUsdc = await quoter.quoteConfigExactInWithImpact.staticCall(quoteInputOneUsdc);

  // Step 2: Find the best pool (maximum output for 1 USDC)
  let bestPoolIdx = -1;
  let maxOutput = 0n;
  for (let i = 0; i < config.pairsToQuote.length; i++) {
    if (quoteResultOneUsdc.quotes[i]?.buy?.success) {
      const amountOut = quoteResultOneUsdc.quotes[i].buy.amountOut as bigint;
      if (amountOut > maxOutput) {
        maxOutput = amountOut;
        bestPoolIdx = i;
      }
    }
  }

  if (bestPoolIdx === -1) {
    throw new Error("No successful quotes found for any pool");
  }

  const bestPair = config.pairsToQuote[bestPoolIdx];
  console.log(`Best pool found at index ${bestPoolIdx}:`);
  console.log(`  DEX: ${bestPair.dex}`);
  console.log(`  Version: ${bestPair.version}`);
  console.log(`  Pool: ${bestPair.poolAddress}`);
  console.log(`  Output for 1 USDC: ${ethers.formatUnits(maxOutput, wethDecimals)} WETH`);

  // Step 3: Wait 1 second
  console.log("Step 2: Waiting 1 second before execution...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Step 4: Run executor for the best pool
  console.log("Step 3: Running executor for the best pool...");
  const rows: PoolExecutionResult[] = [];

  const quotedOutOneUsdc = maxOutput;
  const amountOutMin = quotedOutOneUsdc - (quotedOutOneUsdc * AMOUNT_OUT_MIN_SLIPPAGE_BPS) / 10_000n;
  const step = buildExecutorSwapStep(bestPair, amountInUsdc, amountOutMin);

  try {
    if (DO_REAL_TRANSACTION) {
      const tx = await executor.executeSwaps(
        [step],
        tokenWeth,
        false,
        true,
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null");

      const actualOut = getSwapStepExecutedAmountOut(executor, receipt);
      rows.push({
        status: "ok",
        dex: bestPair.dex,
        version: bestPair.version,
        pool: bestPair.poolAddress,
        quotedOutOneUsdc,
        quotedOutFromConfigNormalized: quotedOutOneUsdc,
        quoteDiffPpm: 0n,
        actualOut,
        slippagePpm: signedSlippagePpm(quotedOutOneUsdc, actualOut),
        gasUsed: receipt.gasUsed,
        txHash: tx.hash,
      });
    } else {
      const [summary, logs] = await executor.executeSwaps.staticCall(
        [step],
        tokenWeth,
        false,
        false,
      ) as [{ totalGasUsed: bigint }, Array<{ amountOut: bigint }>];

      const actualOut = logs[0]?.amountOut ?? 0n;
      rows.push({
        status: "ok",
        dex: bestPair.dex,
        version: bestPair.version,
        pool: bestPair.poolAddress,
        quotedOutOneUsdc,
        quotedOutFromConfigNormalized: quotedOutOneUsdc,
        quoteDiffPpm: 0n,
        actualOut,
        slippagePpm: signedSlippagePpm(quotedOutOneUsdc, actualOut),
        gasUsed: summary.totalGasUsed ?? 0n,
        txHash: "staticCall",
      });
    }
  } catch (e: unknown) {
    const reason = e instanceof Error ? e.message : String(e);
    rows.push({
      status: "failed",
      dex: bestPair.dex,
      version: bestPair.version,
      pool: bestPair.poolAddress,
      quotedOutOneUsdc,
      quotedOutFromConfigNormalized: quotedOutOneUsdc,
      quoteDiffPpm: 0n,
      actualOut: 0n,
      slippagePpm: 0n,
      gasUsed: 0n,
      txHash: "-",
      reason: reason.slice(0, 240),
    });
  }

  console.log("===========================================");
  console.log("Arbitrum Executor: 1 USDC -> WETH (best pool only)");
  console.log("===========================================");
  console.log("RPC:", rpcUrl);
  console.log("Caller:", caller);
  console.log("Quoter:", String(quoter.target));
  console.log("Executor:", String(executor.target));
  console.log("Total pools analyzed:", config.pairsToQuote.length);
  console.log("Amount per execution:", `${AMOUNT_IN_USDC_HUMAN} USDC`);
  console.log("Mode:", DO_REAL_TRANSACTION ? "real tx" : "staticCall simulation");

  console.table(
    rows.map((row) => ({
      status: row.status,
      dex: row.dex,
      version: row.version,
      pool: row.pool,
      quotedWethOneUsdc: ethers.formatUnits(row.quotedOutOneUsdc, wethDecimals),
      actualWeth: ethers.formatUnits(row.actualOut, wethDecimals),
      slippage: ppmToPct(row.slippagePpm),
      slippagePpm: row.slippagePpm.toString(),
      gasUsed: row.gasUsed.toString(),
      txHash: row.txHash,
      reason: row.reason ?? "",
    })),
  );

  const okRow = rows.find((r) => r.status === "ok");
  if (okRow) {
    console.log("===========================================");
    console.log("Execution completed successfully!");
    console.log(`Slippage: ${ppmToPct(okRow.slippagePpm)} (${okRow.slippagePpm.toString()} ppm)`);
  } else {
    console.log("===========================================");
    const failedRow = rows.find((r) => r.status === "failed");
    if (failedRow) {
      console.log("Execution failed!");
      console.log(`Reason: ${failedRow.reason}`);
    }
  }
}

main().catch((e) => {
  console.error("Executor script failed:", e);
  process.exitCode = 1;
});
