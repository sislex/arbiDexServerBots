import { ethers, Interface } from 'ethers';
import ArbExecutorAbi from '../../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import { ArbResult, IJobParams_get_Arbitrum_Arb_Executor_Quotes } from '../../../store/state.types';
import { getArbViaFindArbStore } from '../getArbExecutor.quotes';
import { arbResultToSwapSteps } from './arbResultToSwapSteps';

const VAULT = process.env.EXECUTOR_ADDRESS || '0x4ffDddC895719C3f662364e79f989C4deea44118';

const arbExecutorIface = new Interface(ArbExecutorAbi.abi);

function decodeRevert(error: any) {
  const data =
    error?.data ||
    error?.error?.data ||
    error?.receipt?.revertReason ||
    error?.info?.error?.data;

  if (!data || typeof data !== 'string') {
    return { type: 'UNKNOWN', message: error?.message ?? 'Unknown error' };
  }
  try {
    const decoded = arbExecutorIface.parseError(data);
    return { type: 'CUSTOM_ERROR', name: decoded?.name, args: decoded?.args };
  } catch {
    return { type: 'RAW_REVERT', data };
  }
}

/**
 * Полный цикл:
 * 1. getArbViaFindArbStore → находит прибыльные арбитражные пары
 * 2. Выбирает лучшую (максимальный profit)
 * 3. Строит 2 шага для ArbExecutor.executeSwaps
 * 4. Симулирует → если прибыль ≥ minProfitPct → отправляет реальную TX
 */
export async function executeArbFromStore(
  params: IJobParams_get_Arbitrum_Arb_Executor_Quotes,
  opts: {
    storeKey?: string;
    minProfitPct?: number;    // минимальный % профита для реального свопа (по умолчанию 0.03)
    executeReal?: boolean;     // false = только симуляция
    vaultAddress?: string;
    slippageBps?: number;
    maxFeePerGasGwei?: number;        // максимальная цена газа в gwei (по умолчанию 0.5)
    maxPriorityFeePerGasGwei?: number; // чаевые в gwei (по умолчанию 0.1)
  } = {},
) {
  const {
    storeKey = 'pools33',
    minProfitPct = 0.5,
    executeReal = true,
    vaultAddress = VAULT,
    slippageBps = 5,
    maxFeePerGasGwei = 0.5,
    maxPriorityFeePerGasGwei = 0.1,
  } = opts;

  const rpcUrl = params.rpcUrl || 'https://arb1.arbitrum.io/rpc';

  // ── 1. Поиск арбитража ──
  // console.log('\n🔍 Поиск арбитража через findArbStore...');
  const arbResult = await getArbViaFindArbStore(params, storeKey);

  if (!arbResult.ok) {
    console.log('❌ getArbViaFindArbStore вернул ошибку:', arbResult.error);
    return { ok: false, stage: 'findArb', error: arbResult.error };
  }

  const allResults: ArbResult[] = arbResult.allResults ?? [];
  const profitable = allResults.filter((r) => r.success && BigInt(r.profit) > 0n);

  if (profitable.length === 0) {
    console.log('❌ Прибыльных арбитражей не найдено');
    return {
      ok: true,
      stage: 'findArb',
      blockNumber: arbResult.blockNumber,
      totalResults: allResults.length,
      profitable: 0,
    };
  }

  // ── 2. Выбираем лучший ──
  profitable.sort((a, b) => {
    const pa = BigInt(a.profit);
    const pb = BigInt(b.profit);
    return pa > pb ? -1 : pa < pb ? 1 : 0;
  });

  const best = profitable[0];
  console.log(`\n✅ Лучший арбитраж: buy [${best.buyIndex}] ${best.buyPair} → sell [${best.sellIndex}] ${best.sellPair}`);
  console.log(`   profit=${best.profit}, buyAmountOut=${best.buyAmountOut}, sellAmountOut=${best.sellAmountOut}`);

  // ── 3. Строим шаги для executeSwaps ──
  const { steps, profitToken } = arbResultToSwapSteps(best, params.pairsToQuote, BigInt(slippageBps));

  // console.log(`\n📋 SwapSteps для контракта:`);
  // for (let i = 0; i < steps.length; i++) {
  //   const s = steps[i];
  //   console.log(`   [${i}] kind=${s.kind}, tokenIn=${s.tokenIn}, tokenOut=${s.tokenOut}, amountIn=${s.amountIn}, amountOutMin=${s.amountOutMin}, pool=${s.pool}, router=${s.router}`);
  // }
  // console.log(`   profitToken=${profitToken}`);

  // ── 4. Вычисляем profitPct из ArbResult (findArb) ──
  const amountIn = BigInt(params.pairsToQuote[best.buyIndex].amount);
  const findArbProfit = BigInt(best.profit);
  const findArbProfitPpm = (findArbProfit * 1_000_000n) / amountIn;
  const findArbProfitPct = Number(findArbProfitPpm) / 10_000;

  console.log(`\n📈 Profit из findArb: ${best.profit} (${findArbProfitPct.toFixed(4)}%)`);

  // ── 5. Setup контракта ──
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.error('❌ PRIVATE_KEY не задан в env');
    return { ok: false, stage: 'setup', error: 'PRIVATE_KEY not set' };
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(pk, provider);
  const vault = new ethers.Contract(vaultAddress, ArbExecutorAbi.abi, signer);

  // Решаем нужен ли реальный своп ДО запуска (по данным findArb)
  const shouldExecuteReal = executeReal && findArbProfitPct >= minProfitPct;

  if (!shouldExecuteReal && executeReal) {
    console.log(`\n⏸️  findArb profitPct ${findArbProfitPct.toFixed(4)}% < min ${minProfitPct}% — реальный своп не будет отправлен`);
  }

  // ── 6. Реальный своп ──
  // Данные симуляции уже получены из getArbViaFindArbStore (findArb.staticCall):
  //   best.profit, best.buyAmountOut, best.sellAmountOut
  // Повторная staticCall не нужна — она только добавляет задержку.

  if (!shouldExecuteReal) {
    console.log(`\n⏸️  Реальный своп не отправляем (executeReal=${executeReal}, findArbProfitPct=${findArbProfitPct.toFixed(4)}%, min=${minProfitPct}%)`);
    return {
      ok: true,
      blockNumber: arbResult.blockNumber,
      findArb: { profitPct: findArbProfitPct, profit: best.profit, best },
      realSwap: { ok: true, skipped: true, reason: !executeReal ? 'executeReal=false' : 'profit_too_low' },
    };
  }

  console.log(`\n🚀 Отправка реального свопа (maxFee=${maxFeePerGasGwei} gwei, priority=${maxPriorityFeePerGasGwei} gwei)...`);
  const txStart = performance.now();
  let txResult: any;

  // Сохраняем tx объект и calldata ДО wait() — ethers v6 теряет data после CALL_EXCEPTION
  let sentTx: any = null;
  let sentTxData: string | null = null;

  try {
    sentTx = await vault.executeSwaps(
      steps,
      profitToken,
      true,  // revertIfLoss
      true,  // emitEvents
      {
        gasLimit: 1_200_000n,
        // maxFeePerGas: ethers.parseUnits(maxFeePerGasGwei.toString(), 'gwei'),
        // maxPriorityFeePerGas: ethers.parseUnits(maxPriorityFeePerGasGwei.toString(), 'gwei'),
      },
    );
    sentTxData = sentTx.data; // сохраняем calldata сразу

    console.log(`   📤 TX sent: ${sentTx.hash}`);
    const receipt = await sentTx.wait();
    const txMs = performance.now() - txStart;

    if (receipt.status === 0) {
      // TX revert-нулась on-chain — получаем причину через replay
      let revertReason: any = null;
      try {
        await provider.call({
          to: receipt.to,
          from: receipt.from,
          data: sentTxData,
          blockTag: receipt.blockNumber,
        });
      } catch (replayErr: any) {
        revertReason = decodeRevert(replayErr);
      }

      txResult = {
        ok: false,
        error: revertReason ?? { type: 'TX_REVERTED_ON_CHAIN' },
        reason: revertReason?.name ?? revertReason?.message ?? 'TX reverted on-chain',
        txHash: sentTx.hash,
        block: Number(receipt.blockNumber),
        gas: Number(receipt.gasUsed),
        latencyMs: Math.round(txMs),
      };
    } else {
      txResult = {
        ok: true,
        txHash: sentTx.hash,
        block: Number(receipt.blockNumber),
        gas: Number(receipt.gasUsed),
        latencyMs: Math.round(txMs),
      };
    }
  } catch (e: any) {
    const txHash = sentTx?.hash ?? e.transaction?.hash ?? e.receipt?.hash ?? null;
    const decoded = decodeRevert(e);

    // Replay на блоке receipt — используем сохранённый sentTxData
    let replayDecoded: any = null;
    const replayData = sentTxData ?? e.transaction?.data;
    const receiptBlock = e.receipt?.blockNumber;

    if (decoded.type === 'UNKNOWN' && receiptBlock && replayData) {
      try {
        await provider.call({
          to: e.receipt.to ?? vaultAddress,
          from: e.receipt.from ?? signer.address,
          data: replayData,
          blockTag: receiptBlock,
        });
      } catch (replayErr: any) {
        replayDecoded = decodeRevert(replayErr);
      }
    }

    const finalError = replayDecoded ?? decoded;
    txResult = {
      ok: false,
      error: finalError,
      reason: finalError?.name ?? finalError?.message ?? e.reason ?? e.shortMessage ?? e.message,
      txHash,
      revertData: e?.data ?? e?.error?.data ?? e?.info?.error?.data ?? null,
      latencyMs: Math.round(performance.now() - txStart),
    };
  }

  const totalMs = Math.round(performance.now() - txStart);

  // ── 7. Вывод результатов ──
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  РЕЗУЛЬТАТЫ');
  console.log(`${'═'.repeat(60)}`);

  console.log(`\n📈 findArb (симуляция из контракта):`);
  console.log(`   block: ${arbResult.blockNumber}, profit: ${best.profit} (${findArbProfitPct.toFixed(4)}%)`);
  console.log(`   buyAmountOut: ${best.buyAmountOut}, sellAmountOut: ${best.sellAmountOut}`);

  console.log('\n💰 Реальный своп:');
  if (txResult.ok) {
    console.log(`   ✅ TX confirmed (${txResult.latencyMs} ms)`);
    console.log(`   hash: ${txResult.txHash}, block: ${txResult.block}, gas: ${txResult.gas}`);
  } else {
    console.log(`   ❌ FAILED (${txResult.latencyMs} ms): ${txResult.reason}`);
    if (txResult.txHash) console.log(`   txHash: ${txResult.txHash}`);
    console.log(`   error:`, JSON.stringify(txResult.error, null, 2));
    if (txResult.revertData) console.log(`   revertData: ${txResult.revertData}`);
  }

  console.log(`\n   Общее время (swap): ${totalMs} ms`);
  console.log('');

  return {
    ok: true,
    blockNumber: arbResult.blockNumber,
    findArb: { profitPct: findArbProfitPct, profit: best.profit, best },
    realSwap: txResult.ok
      ? { ok: true, txHash: txResult.txHash, block: txResult.block, gas: txResult.gas, latencyMs: txResult.latencyMs }
      : { ok: false, error: txResult.error, reason: txResult.reason, txHash: txResult.txHash, revertData: txResult.revertData, latencyMs: txResult.latencyMs },
    totalMs,
  };
}


