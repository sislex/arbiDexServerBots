// scripts/arbQuoter/compareCamelotV2.ts
//
// Сравнение котировок ArbQuoter (getAmountsOut) vs ArbExecutor (simulateSwaps)
// только для Camelot V2 пула WETH → USDC.
//
// Использует задеплоенные контракты из .env:
//   QUOTER_ADDRESS, EXECUTOR_ADDRESS
//
// Usage:
//   npx hardhat run scripts/arbQuoter/compareCamelotV2.ts --network arbitrum

import { ethers } from "hardhat";

// ── Camelot V2: WETH → USDC ────────────────────────────────────
const CAMELOT_V2_ROUTER = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";
const CAMELOT_V2_POOL   = "0x54b26faf3671677c19f70c4b879a6f7b898f732c";

const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

const AMOUNT_IN = ethers.parseUnits("50", 6); // 50 USDC

// SwapStepsConfigStore.SwapStep struct (kind=2 = CAMELOT_V2_EXACT_IN)
const CAMELOT_V2_STEP = {
  kind: 2,
  router: CAMELOT_V2_ROUTER,
  path: [USDC, WETH],
  pool: ethers.ZeroAddress,
  tokenIn: USDC,
  tokenOut: WETH,
  v4Fee: 0,
  v4TickSpacing: 0,
  v4Hooks: ethers.ZeroAddress,
};

// ArbExecutor.SwapStep struct (with amountIn etc.)
const EXECUTOR_STEP = {
  kind: 2, // CAMELOT_V2_EXACT_IN
  router: CAMELOT_V2_ROUTER,
  path: [USDC, WETH],
  pool: ethers.ZeroAddress,
  tokenIn: USDC,
  tokenOut: WETH,
  amountIn: AMOUNT_IN,
  amountOutMin: 0,
  sqrtPriceLimitX96: 0,
  deadline: 0,
};

function ms(start: bigint, end: bigint): string {
  return (Number((end - start) / 1_000_000n)).toFixed(1);
}

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = owner.provider!;

  const quoterAddr   = process.env.QUOTER_ADDRESS;
  const executorAddr = process.env.EXECUTOR_ADDRESS;

  if (!quoterAddr)   throw new Error("Missing QUOTER_ADDRESS in .env");
  if (!executorAddr) throw new Error("Missing EXECUTOR_ADDRESS in .env");

  console.log("Owner:    ", owner.address);
  console.log("Quoter:   ", quoterAddr);
  console.log("Executor: ", executorAddr);
  console.log("AmountIn: ", ethers.formatUnits(AMOUNT_IN, 6), "USDC");
  console.log("Pool:     ", CAMELOT_V2_POOL, "(Camelot V2 WETH/USDC)");
  console.log("Router:   ", CAMELOT_V2_ROUTER);

  const block = await provider.getBlockNumber();
  console.log("Block:    ", block);

  const quoter   = await ethers.getContractAt("ArbQuoter",   quoterAddr);
  const executor = await ethers.getContractAt("ArbExecutor",  executorAddr);

  // ═══════════════════════════════════════════════════════════
  // 1) ArbQuoter.quoteExactIn (staticCall, view-like)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════");
  console.log("1) ArbQuoter.quoteExactIn (Camelot V2)");
  console.log("═══════════════════════════════════════════════════");

  const t1 = process.hrtime.bigint();
  let quoterOut = 0n;
  let quoterOk  = false;

  try {
    const [amountOut, success] = await quoter.quoteExactIn.staticCall(
      CAMELOT_V2_STEP,
      AMOUNT_IN,
    );
    quoterOut = amountOut;
    quoterOk  = success;
  } catch (e: any) {
    console.log("❌ ArbQuoter reverted:", e.message?.slice(0, 300));
  }
  const t2 = process.hrtime.bigint();

  console.log("amountOut:", ethers.formatEther(quoterOut), "WETH", `(raw: ${quoterOut})`);
  console.log("success:  ", quoterOk);
  console.log("time:     ", ms(t1, t2), "ms");

  // ═══════════════════════════════════════════════════════════
  // 2) ArbQuoter.quoteRoundTrip (buy + sell approximation)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════");
  console.log("2) ArbQuoter.quoteRoundTrip (Camelot V2)");
  console.log("═══════════════════════════════════════════════════");

  const t3 = process.hrtime.bigint();
  let roundTrip: any = null;

  try {
    roundTrip = await quoter.quoteRoundTrip.staticCall(
      CAMELOT_V2_STEP,
      AMOUNT_IN,
    );
  } catch (e: any) {
    console.log("❌ quoteRoundTrip reverted:", e.message?.slice(0, 300));
  }
  const t4 = process.hrtime.bigint();

  if (roundTrip) {
    console.log("buyAmountOut:  ", ethers.formatEther(roundTrip.buyAmountOut), "WETH",
      `(raw: ${roundTrip.buyAmountOut})`);
    console.log("sellAmountOut: ", ethers.formatEther(roundTrip.sellAmountOut), "WETH",
      `(raw: ${roundTrip.sellAmountOut})`);
    console.log("profit:        ", roundTrip.profit.toString(), "(tokenOut units, >0 = profitable)");
    console.log("success:       ", roundTrip.success);
  }
  console.log("time:          ", ms(t3, t4), "ms");

  // ═══════════════════════════════════════════════════════════
  // 3) ArbExecutor.simulateSwaps (staticCall — always reverts with Simulated)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════");
  console.log("3) ArbExecutor.simulateSwaps (Camelot V2)");
  console.log("═══════════════════════════════════════════════════");

  // Проверяем баланс USDC на executor
  const usdc = await ethers.getContractAt("IERC20", USDC);
  const executorUsdcBal = await usdc.balanceOf(executorAddr);
  console.log("Executor USDC balance:", ethers.formatUnits(executorUsdcBal, 6), "USDC");

  if (executorUsdcBal < AMOUNT_IN) {
    console.log("⚠  Executor has insufficient USDC for simulateSwaps.");
    console.log("   Need:", ethers.formatUnits(AMOUNT_IN, 6), "USDC");
    console.log("   Have:", ethers.formatUnits(executorUsdcBal, 6), "USDC");
    console.log("   Skipping simulateSwaps — cannot compare.");
    printSummary(quoterOut, quoterOk, 0n, false);
    return;
  }

  const t5 = process.hrtime.bigint();
  let executorOut = 0n;
  let executorOk  = false;
  let execGas     = 0n;

  try {
    // simulateSwaps always reverts with Simulated(summary, logs)
    await executor.simulateSwaps.staticCall(
      [EXECUTOR_STEP],
      WETH,  // profitToken (buying WETH)
      false, // revertIfLoss
    );
    // Should not reach here
    console.log("⚠ simulateSwaps did not revert (unexpected)");
  } catch (e: any) {
    // Decode Simulated error
    const decoded = tryDecodeSimulated(executor.interface, e);
    if (decoded) {
      executorOk  = true;
      executorOut = decoded.amountOut;
      execGas     = decoded.totalGas;
    } else {
      console.log("❌ Could not decode Simulated error:", e.message?.slice(0, 300));
    }
  }
  const t6 = process.hrtime.bigint();

  console.log("amountOut:", ethers.formatEther(executorOut), "WETH", `(raw: ${executorOut})`);
  console.log("success:  ", executorOk);
  console.log("simGas:   ", execGas.toString());
  console.log("time:     ", ms(t5, t6), "ms");

  // ═══════════════════════════════════════════════════════════
  // 4) Comparison
  // ═══════════════════════════════════════════════════════════
  printSummary(quoterOut, quoterOk, executorOut, executorOk);
}

// ── Helpers ──────────────────────────────────────────────────

function printSummary(
  quoterOut: bigint,
  quoterOk: boolean,
  executorOut: bigint,
  executorOk: boolean,
) {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("COMPARISON: Camelot V2 USDC → WETH");
  console.log("═══════════════════════════════════════════════════");

  const row = (label: string, val: bigint, ok: boolean) =>
    `${label.padEnd(16)} ${ok ? ethers.formatEther(val).padStart(20) + " WETH" : "FAIL".padStart(20)}  (raw: ${val})`;

  console.log(row("ArbQuoter",   quoterOut,   quoterOk));
  console.log(row("ArbExecutor", executorOut, executorOk));

  if (quoterOk && executorOk) {
    const diff = Number(quoterOut) - Number(executorOut);
    const pct  = executorOut > 0n
      ? (diff / Number(executorOut) * 100)
      : 0;

    console.log(`${"Delta".padEnd(16)} ${diff >= 0 ? "+" : ""}${diff} (${pct >= 0 ? "+" : ""}${pct.toFixed(6)}%)`);

    if (Math.abs(pct) < 0.01) {
      console.log("\n✅ MATCH — результаты идентичны (< 0.01%)");
    } else if (Math.abs(pct) < 0.5) {
      console.log("\n≈ CLOSE — разница < 0.5%");
    } else {
      console.log("\n⚠ DIFFER — результаты расходятся значительно!");
    }
  } else if (!quoterOk && !executorOk) {
    console.log("\n⚠ Оба метода не смогли получить котировку");
  } else {
    console.log(`\n⚠ ${quoterOk ? "Executor" : "Quoter"} не смог получить котировку`);
  }

  console.log("═══════════════════════════════════════════════════\n");
}

function tryDecodeSimulated(
  iface: any,
  err: any,
): { amountOut: bigint; totalGas: bigint } | null {
  // ethers v6: err.data contains the revert data
  const data: string | undefined = err.data ?? err.error?.data;
  if (!data || data.length < 10) return null;

  try {
    const decoded = iface.decodeErrorResult("Simulated", data);
    const summary = decoded[0]; // ArbSummary
    const logs    = decoded[1]; // SwapLog[]

    const amountOut = logs.length > 0
      ? logs[logs.length - 1].amountOut
      : 0n;

    return {
      amountOut,
      totalGas: summary.totalGasUsed,
    };
  } catch {
    return null;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});









