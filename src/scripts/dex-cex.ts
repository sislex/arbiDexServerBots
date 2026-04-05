import 'dotenv/config';
import { ethers } from 'ethers';
import { dexCexComparison } from '../jobs/getQuoteFromArbExecutor/helpers/dexCexComparison';
import { dexCexResultToSwapStep, SignalDirection } from '../jobs/getQuoteFromArbExecutor/helpers/dexCexResultToSwapStep';
import { swap } from '../jobs/getQuoteFromArbExecutor/helpers/swap';
import { IJobParams_get_Arbitrum_Arb_Executor_Quotes } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';
import ArbExecutorAbi from '../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';

const VAULT_ADDRESS = process.env.EXECUTOR_ADDRESS || '0x4ffDddC895719C3f662364e79f989C4deea44118';

async function main() {
  const jobParams = BotList10[1].jobParams as IJobParams_get_Arbitrum_Arb_Executor_Quotes;

  // ── 1. Получаем DEX-CEX сравнение ──
  const result = await dexCexComparison(jobParams);

  if (!result.ok) {
    console.error('❌ dexCexComparison failed:', result.error);
    return;
  }

  // ── 2. Выбираем направление по лучшему W-AVG сигналу ──
  const SIGNAL_THRESHOLD = 0.1; // %
  let direction: SignalDirection | null = null;
  if (result.avgBuyPct >= SIGNAL_THRESHOLD && result.avgBuyPct >= result.avgSellPct) {
    direction = 'buy';
  } else if (result.avgSellPct >= SIGNAL_THRESHOLD) {
    direction = 'sell';
  }

  if (!direction) {
    console.log('\n❌ Нет выгодных сигналов — пропускаем');
    return;
  }

  // ── 3. Конвертируем в SwapSteps для ArbExecutor ──
  const { steps, profitToken } = dexCexResultToSwapStep(result, jobParams.pairsToQuote, direction);

  const dirLabel = direction === 'buy' ? 'BUY ETH (WETH→USDC→WETH)' : 'SELL ETH (WETH→USDC)';
  // SELL ETH → bestBuyPool (макс USDC за WETH)
  // BUY ETH  → step0: bestBuyPool (WETH→USDC), step1: bestSellPool (USDC→WETH)
  const poolLabel = direction === 'buy'
    ? `step0: ${result.bestBuyPool} [${result.bestBuyIndex}], step1: ${result.bestSellPool} [${result.bestSellIndex}]`
    : `${result.bestBuyPool} [${result.bestBuyIndex}]`;

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  🔄 ${dirLabel}`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  pool: ${poolLabel}`);
  console.log(`  profitToken: ${profitToken}`);
  console.log(`  steps: ${steps.length}`);

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    console.log(`  [${i}] kind=${s.kind}, ${s.tokenIn} → ${s.tokenOut}`);
    console.log(`       amountIn=${s.amountIn}, amountOutMin=${s.amountOutMin}`);
    console.log(`       pool=${s.pool}, router=${s.router}`);
  }

  // ── 4. Симуляция через ArbExecutor.executeSwaps ──
  console.log(`\n🧪 Симуляция...`);
  const rpcUrl = jobParams.rpcUrl || 'https://arb1.arbitrum.io/rpc';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.error('❌ PRIVATE_KEY не задан');
    return;
  }
  const signer = new ethers.Wallet(pk, provider);
  const vault = new ethers.Contract(VAULT_ADDRESS, ArbExecutorAbi.abi, signer);

  const t0 = performance.now();
  const logs = await swap(steps, vault, true, profitToken);
  const simMs = Math.round(performance.now() - t0);

  if (logs.length === 0) {
    console.log(`   ❌ Симуляция не удалась (${simMs} ms)`);
    return;
  }

  console.log(`   ✅ Симуляция OK (${simMs} ms)`);
  for (let i = 0; i < logs.length; i++) {
    const l = logs[i];
    console.log(`   step[${i}]: amountIn=${l.amountIn}, amountOut=${l.amountOut}, gas=${l.gas}`);
  }

  // Если 2 шага (BUY) — показываем прибыль
  if (steps.length === 2 && logs.length === 2) {
    const amountIn = steps[0].amountIn;
    const amountOut = logs[1].amountOut;
    const profit = amountOut - amountIn;
    const profitPct = Number(profit * 10000n / amountIn) / 100;
    console.log(`\n   💰 profit: ${profit} (${profitPct.toFixed(4)}%)`);
  }

  // Если 1 шаг (SELL) — показываем сколько USDC получили
  if (steps.length === 1 && logs.length === 1) {
    const usdcOut = Number(logs[0].amountOut) / 1e6;
    const ethIn = Number(steps[0].amountIn) / 1e18;
    const effectivePrice = usdcOut / ethIn;
    console.log(`\n   💰 Получено: ${usdcOut.toFixed(6)} USDC за ${ethIn} ETH → $${effectivePrice.toFixed(2)}/ETH`);
    console.log(`   W-AVG CEX mid: $${result.weightedAvgCexMid.toFixed(2)}`);
    console.log(`   Δ: $${(effectivePrice - result.weightedAvgCexMid).toFixed(4)}`);
  }

  console.log('');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
