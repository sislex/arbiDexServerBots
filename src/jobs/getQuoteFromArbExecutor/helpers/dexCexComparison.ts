// ── CEX weights для взвешенного среднего ──
import {
  CexQuote,
  DexCexComparisonResult,
  DexCexSignal,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes,
  IJobType,
} from '../../../store/state.types';
import {getArbViaFindArb} from '../getArbExecutor.quotes';
import {getBinanceQuote} from './getBinanceQuote';
import {getMexcQuote} from '../../getMexcQuotes/helpers/getMexcQuote';
import {getBybitQuote} from '../../getBybitQuotes/helpers/getBybitQuote';
import {toCexQuote} from './toCexQuote';

const DEFAULT_CEX_WEIGHT: Record<string, number> = {
  Binance: 4,
  Bybit:   3,
  MEXC:    1,
};

// DEX gas на Arbitrum (~$0.02 за swap)
const DEFAULT_DEX_GAS_USD = 0.001;

const EMPTY_RESULT: DexCexComparisonResult = {
  ok: false,
  method: 'dexCexComparison',
  blockNumber: 0,
  latencyMs: 0,
  metrics: [],
  dexBuyPrice: 0, dexSellPrice: 0, dexMidPrice: 0, dexSpread: 0, dexSpreadPct: 0,
  bestBuyPool: '', bestBuyIndex: -1, bestSellPool: '', bestSellIndex: -1,
  cexQuotes: [], weightedAvgCexMid: 0,
  signals: [], avgBuyProfit: 0, avgBuyPct: 0, avgSellProfit: 0, avgSellPct: 0,
  groupsCount: 0, storeStepsCount: 0, resultsCount: 0, allResults: [], profitableResults: [],
};

export async function dexCexComparison(
  jobParams: IJobParams_get_Arbitrum_Arb_Executor_Quotes,
  opts: {
    consoleOutput?: boolean;
    dexGasUsd?: number;
    cexWeight?: Record<string, number>;
    /** Минимальный % разницы для сигнала (по умолчанию 0.1%) */
    signalThresholdPct?: number;
  } = {},
): Promise<DexCexComparisonResult> {
  const {
    consoleOutput = true,
    dexGasUsd: DEX_GAS_USD = DEFAULT_DEX_GAS_USD,
    cexWeight: CEX_WEIGHT = DEFAULT_CEX_WEIGHT,
    signalThresholdPct: SIGNAL_THRESHOLD_PCT = 0.1,
  } = opts;
  const totalStart = performance.now();
  const metrics: { step: string; ms: number }[] = [];

  if (jobParams.jobType !== IJobType.GET_ARB_EXECUTOR_QUOTES) {
    console.error('❌ BotListFilteredUSDC[0] не является GET_ARB_EXECUTOR_QUOTES');
    return { ...EMPTY_RESULT, error: 'jobParams не является GET_ARB_EXECUTOR_QUOTES' };
  }

  const pairsToQuote = (jobParams as IJobParams_get_Arbitrum_Arb_Executor_Quotes).pairsToQuote;
  const amountIn = BigInt(pairsToQuote[0].amount);
  const amountInEth = Number(amountIn) / 1e18;


  // ── Запускаем все 4 параллельно ──
  let t0 = performance.now();
  const [arbResult, binanceRaw, mexcRaw, bybitRaw] = await Promise.all([
    getArbViaFindArb(jobParams as IJobParams_get_Arbitrum_Arb_Executor_Quotes),
    getBinanceQuote('ETHUSDC'),
    getMexcQuote('ETHUSDT'),
    getBybitQuote('ETHUSDT').catch((e) => { console.warn(`  ⚠️ Bybit недоступен: ${e.message}`); return null; }),
  ]);
  metrics.push({ step: 'parallel fetch (DEX + CEX)', ms: performance.now() - t0 });


  if (!arbResult.ok) {
    console.error('❌ getArbViaFindArb error:', arbResult.error);
    const totalMs = performance.now() - totalStart;
    return {
      ...EMPTY_RESULT,
      error: arbResult.error,
      latencyMs: Math.round(totalMs),
      metrics: metrics.map(m => ({ step: m.step, ms: Math.round(m.ms) })),
    };
  }

  const cexList: CexQuote[] = [
    toCexQuote('Binance', binanceRaw),
    toCexQuote('MEXC', mexcRaw),
  ];
  if (bybitRaw) cexList.push(toCexQuote('Bybit', bybitRaw));

  // ── Находим лучшие DEX цены ──
  const allResults = arbResult.allResults ?? [];

  let buyAmountOutRaw = 0n;
  let bestBuyPool = '';
  let bestBuyIndex = -1;

  let bestSellAmountOut = 0n;
  let bestSellPool = '';
  let bestSellIndex = -1;

  for (const r of allResults) {
    if (!r.success) continue;
    const bOut = BigInt(r.buyAmountOut);
    const sOut = BigInt(r.sellAmountOut);
    if (bOut === 0n || sOut === 0n) continue;

    if (bOut > buyAmountOutRaw) {
      buyAmountOutRaw = bOut;
      bestBuyPool = r.buyPair ?? `pool[${r.buyIndex}]`;
      bestBuyIndex = r.buyIndex;
    }
    if (sOut > bestSellAmountOut) {
      bestSellAmountOut = sOut;
      bestSellPool = r.sellPair ?? `pool[${r.sellIndex}]`;
      bestSellIndex = r.sellIndex;
    }
  }

  if (buyAmountOutRaw === 0n) {
    console.log('❌ Нет успешных котировок WETH/USDC');
    const totalMs = performance.now() - totalStart;
    return {
      ...EMPTY_RESULT,
      error: 'Нет успешных котировок WETH/USDC',
      blockNumber: arbResult.blockNumber ?? 0,
      latencyMs: Math.round(totalMs),
      metrics: metrics.map(m => ({ step: m.step, ms: Math.round(m.ms) })),
      cexQuotes: cexList,
      groupsCount: arbResult.groupsCount ?? 0,
      storeStepsCount: pairsToQuote.length,
      resultsCount: allResults.length,
      allResults,
      profitableResults: arbResult.profitableResults ?? [],
    };
  }

  // bestBuyPool даёт больше всего USDC за WETH → лучшая цена ПРОДАЖИ ETH (bid)
  // bestSellPool даёт больше всего WETH обратно из USDC → лучшая цена ПОКУПКИ ETH (ask, дешевле)
  const buyAmountOutUsdc = Number(buyAmountOutRaw) / 1e6;
  const sellAmountOutEth = Number(bestSellAmountOut) / 1e18;

  // dexSellPrice = bid = сколько USDC получишь за 1 ETH в лучшем пуле (bestBuyPool)
  const dexSellPrice = buyAmountOutUsdc / amountInEth;
  // dexBuyPrice = ask = сколько USDC стоит купить 1 ETH (через bestSellPool, обратный путь)
  const dexBuyPrice = buyAmountOutUsdc / sellAmountOutEth;

  const dexMidPrice = (dexBuyPrice + dexSellPrice) / 2;
  const dexSpread = dexBuyPrice - dexSellPrice; // ask - bid (ask > bid = нормальный spread)
  const dexSpreadPct = (dexSpread / dexSellPrice) * 100;

  if (consoleOutput) {

    console.log(`\n${'='.repeat(60)}`);
    console.log('  DEX-CEX: лучшие цены DEX vs Binance vs MEXC vs Bybit');
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Пулов: ${pairsToQuote.length}, amountIn: ${amountInEth} ETH, DEX gas: ~$${DEX_GAS_USD}`);

    // ── Вывод: CEX котировки ──
    for (const cex of cexList) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`  📊 ${cex.name} ${cex.symbol} (taker fee: ${cex.takerFeePct}%)`);
      console.log(`${'─'.repeat(60)}`);
      console.log(`  bid (продать ETH): $${cex.bidPrice.toFixed(2)}  → net: $${cex.effectiveBid.toFixed(2)}`);
      console.log(`  ask (купить ETH):  $${cex.askPrice.toFixed(2)}  → net: $${cex.effectiveAsk.toFixed(2)}`);
      console.log(`  spread:            $${cex.spread.toFixed(4)} (${cex.spreadPct.toFixed(4)}%)`);
      console.log(`  latency:           ${cex.latencyMs} ms`);
    }

    // ── Вывод: DEX лучшие цены (формат как CEX) ──
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  📊 DEX WETH/USDC (block: ${arbResult.blockNumber}, amountIn: ${amountInEth} ETH)`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`  bid (продать ETH): $${dexSellPrice.toFixed(2)}  [${bestBuyIndex}] ${bestBuyPool}`);
    console.log(`  ask (купить ETH):  $${dexBuyPrice.toFixed(2)}  [${bestSellIndex}] ${bestSellPool}`);
    console.log(`  mid:               $${dexMidPrice.toFixed(2)}`);
    console.log(`  spread:            $${dexSpread.toFixed(4)} (${dexSpreadPct.toFixed(4)}%)`);
    console.log(`  latency:           ${arbResult.latencyMs} ms`);

    // ══════════════════════════════════════════════════════════
    //  НОВАЯ ТАБЛИЦА: торгуем ТОЛЬКО на DEX, CEX = ориентир
    //  Логика: цена на DEX сдвинется к CEX mid
    // ══════════════════════════════════════════════════════════

    console.log(`\n${'═'.repeat(70)}`);
    console.log('  📊 СИГНАЛЫ: торгуем ТОЛЬКО на DEX, CEX mid = целевая цена');
    console.log(`${'═'.repeat(70)}`);
  }

  // ── Сводная таблица ──
  interface SignalRow {
    'Цена $/ETH': string;
    'Δ vs DEX buy': string;
    'Δ vs DEX sell': string;
    'BUY на DEX': string;
    'SELL на DEX': string;
  }
  const table: Record<string, Partial<SignalRow>> = {};

  // DEX строки
  // dexBuyPrice (ask) = цена покупки ETH → через bestSellPool (дешевле купить ETH)
  // dexSellPrice (bid) = цена продажи ETH → через bestBuyPool (дороже продать ETH)
  table['DEX BUY (ask)'] = {
    'Цена $/ETH': `$${dexBuyPrice.toFixed(2)}`,
    'Δ vs DEX buy': '—',
    'Δ vs DEX sell': '—',
    'BUY на DEX': `${bestSellPool}`,
    'SELL на DEX': '',
  };
  table['DEX SELL (bid)'] = {
    'Цена $/ETH': `$${dexSellPrice.toFixed(2)}`,
    'Δ vs DEX buy': '—',
    'Δ vs DEX sell': '—',
    'BUY на DEX': '',
    'SELL на DEX': `${bestBuyPool}`,
  };

  const allBuyProfits: { value: number; weight: number }[] = [];
  const allBuyPcts: { value: number; weight: number }[] = [];
  const allSellProfits: { value: number; weight: number }[] = [];
  const allSellPcts: { value: number; weight: number }[] = [];
  const signals: DexCexSignal[] = [];

  for (const cex of cexList) {
    // ── BUY на DEX: покупаем ETH на DEX по dexBuyPrice, ожидаем что цена вырастет к cex.midPrice
    //    profit = (cex.mid − dexBuyPrice) × amountInEth − gas
    const buyProfit = (cex.midPrice - dexBuyPrice) * amountInEth - DEX_GAS_USD;
    const buyProfitPct = ((cex.midPrice - dexBuyPrice) / dexBuyPrice) * 100;
    const buySignal = buyProfitPct >= SIGNAL_THRESHOLD_PCT;

    // ── SELL на DEX: продаём ETH на DEX по dexSellPrice, ожидаем что цена упадёт к cex.midPrice
    //    profit = (dexSellPrice − cex.mid) × amountInEth − gas
    const sellProfit = (dexSellPrice - cex.midPrice) * amountInEth - DEX_GAS_USD;
    const sellProfitPct = ((dexSellPrice - cex.midPrice) / cex.midPrice) * 100;
    const sellSignal = sellProfitPct >= SIGNAL_THRESHOLD_PCT;

    signals.push({ cexName: cex.name, buyProfit, buyProfitPct, buySignal, sellProfit, sellProfitPct, sellSignal });

    const w = CEX_WEIGHT[cex.name] ?? 1;
    allBuyProfits.push({ value: buyProfit, weight: w });
    allBuyPcts.push({ value: buyProfitPct, weight: w });
    allSellProfits.push({ value: sellProfit, weight: w });
    allSellPcts.push({ value: sellProfitPct, weight: w });

    const deltaBuy = cex.midPrice - dexBuyPrice;
    const deltaSell = dexSellPrice - cex.midPrice;

    if (consoleOutput) {

      console.log(`\n  ── ${cex.name} (${cex.symbol}) mid: $${cex.midPrice.toFixed(2)} ──`);
      console.log(`  BUY ETH на DEX:  dexBuy=$${dexBuyPrice.toFixed(2)}  cexMid=$${cex.midPrice.toFixed(2)}  Δ=$${deltaBuy.toFixed(4)} (${buyProfitPct >= 0 ? '+' : ''}${buyProfitPct.toFixed(4)}%)`);
      console.log(`    profit: $${buyProfit.toFixed(4)} ${buySignal ? '✅ BUY' : '❌ нет сигнала'}`);
      console.log(`  SELL ETH на DEX: dexSell=$${dexSellPrice.toFixed(2)}  cexMid=$${cex.midPrice.toFixed(2)}  Δ=$${deltaSell.toFixed(4)} (${sellProfitPct >= 0 ? '+' : ''}${sellProfitPct.toFixed(4)}%)`);
      console.log(`    profit: $${sellProfit.toFixed(4)} ${sellSignal ? '✅ SELL' : '❌ нет сигнала'}`);

      table[`${cex.name} mid`] = {
        'Цена $/ETH': `$${cex.midPrice.toFixed(2)}`,
        'Δ vs DEX buy': `${buyProfitPct >= 0 ? '+' : ''}${buyProfitPct.toFixed(4)}%`,
        'Δ vs DEX sell': `${sellProfitPct >= 0 ? '+' : ''}${sellProfitPct.toFixed(4)}%`,
        'BUY на DEX': `${buySignal ? '✅' : '❌'} ${buyProfitPct >= 0 ? '+' : ''}${buyProfitPct.toFixed(4)}%`,
        'SELL на DEX': `${sellSignal ? '✅' : '❌'} ${sellProfitPct >= 0 ? '+' : ''}${sellProfitPct.toFixed(4)}%`,
      };
    }

  }

  // Взвешенное среднее (weighted average)
  const weightedAvg = (arr: { value: number; weight: number }[]) => {
    const totalW = arr.reduce((s, x) => s + x.weight, 0);
    return arr.reduce((s, x) => s + x.value * x.weight, 0) / totalW;
  };

  const avgBuyProfit = weightedAvg(allBuyProfits);
  const avgBuyPct = weightedAvg(allBuyPcts);
  const avgSellProfit = weightedAvg(allSellProfits);
  const avgSellPct = weightedAvg(allSellPcts);

  const totalWeight = cexList.reduce((s, c) => s + (CEX_WEIGHT[c.name] ?? 1), 0);
  const avgCexMidCalc = cexList.reduce((s, c) => s + c.midPrice * (CEX_WEIGHT[c.name] ?? 1), 0) / totalWeight;

  if (consoleOutput) {

    table['W-AVG CEX mid'] = {
      'Цена $/ETH': `$${avgCexMidCalc.toFixed(2)}`,
      'Δ vs DEX buy': `${avgBuyPct >= 0 ? '+' : ''}${avgBuyPct.toFixed(4)}%`,
      'Δ vs DEX sell': `${avgSellPct >= 0 ? '+' : ''}${avgSellPct.toFixed(4)}%`,
      'BUY на DEX': `${avgBuyPct >= SIGNAL_THRESHOLD_PCT ? '✅' : '❌'} ${avgBuyPct >= 0 ? '+' : ''}${avgBuyPct.toFixed(4)}%`,
      'SELL на DEX': `${avgSellPct >= SIGNAL_THRESHOLD_PCT ? '✅' : '❌'} ${avgSellPct >= 0 ? '+' : ''}${avgSellPct.toFixed(4)}%`,
    };

    console.log(`\n${'─'.repeat(70)}`);
    console.table(table);

    // ── Итог ──
    console.log(`\n${'═'.repeat(70)}`);
    console.log('  💡 ИТОГ (W-AVG CEX mid = целевая цена, веса: Binance=4, Bybit=3, MEXC=1)');
    console.log(`${'═'.repeat(70)}`);
    console.log(`  DEX buy price (ask):  $${dexBuyPrice.toFixed(2)}  (${bestSellPool})`);
    console.log(`  DEX sell price (bid): $${dexSellPrice.toFixed(2)}  (${bestBuyPool})`);
    console.log(`  W-AVG CEX mid:   $${avgCexMidCalc.toFixed(2)}`);
    console.log(`  DEX spread:      $${dexSpread.toFixed(4)} (${dexSpreadPct.toFixed(4)}%)`);
    console.log(`  W-AVG BUY signal:  $${avgBuyProfit.toFixed(4)} (${avgBuyPct >= 0 ? '+' : ''}${avgBuyPct.toFixed(4)}%) threshold: ${SIGNAL_THRESHOLD_PCT}%`);
    console.log(`  W-AVG SELL signal: $${avgSellProfit.toFixed(4)} (${avgSellPct >= 0 ? '+' : ''}${avgSellPct.toFixed(4)}%) threshold: ${SIGNAL_THRESHOLD_PCT}%`);

  }

  if (avgBuyPct >= SIGNAL_THRESHOLD_PCT) {
    console.log(`\n  ✅ BUY ETH на DEX @ $${dexBuyPrice.toFixed(2)} (${bestSellPool}) → avg profit $${avgBuyProfit.toFixed(4)} (${avgBuyPct.toFixed(4)}%) ≥ ${SIGNAL_THRESHOLD_PCT}%`);
  }
  if (avgSellPct >= SIGNAL_THRESHOLD_PCT) {
    console.log(`  ✅ SELL ETH на DEX @ $${dexSellPrice.toFixed(2)} (${bestBuyPool}) → avg profit $${avgSellProfit.toFixed(4)} (${avgSellPct.toFixed(4)}%) ≥ ${SIGNAL_THRESHOLD_PCT}%`);
  }
  if (avgBuyPct < SIGNAL_THRESHOLD_PCT && avgSellPct < SIGNAL_THRESHOLD_PCT) {
    console.log(`\n  ❌ Нет сигналов (W-AVG BUY: ${avgBuyPct.toFixed(4)}%, SELL: ${avgSellPct.toFixed(4)}% < порог ${SIGNAL_THRESHOLD_PCT}%)`);
  }

  metrics.push({ step: 'comparison', ms: performance.now() - t0 });

  const totalMs = performance.now() - totalStart;

  return {
    ok: true,
    method: 'dexCexComparison',
    blockNumber: arbResult.blockNumber ?? 0,
    latencyMs: Math.round(totalMs),
    metrics: metrics.map(m => ({ step: m.step, ms: Math.round(m.ms) })),
    // DEX
    dexBuyPrice,
    dexSellPrice,
    dexMidPrice,
    dexSpread,
    dexSpreadPct,
    bestBuyPool,
    bestBuyIndex,
    bestSellPool,
    bestSellIndex,
    // CEX
    cexQuotes: cexList,
    weightedAvgCexMid: avgCexMidCalc,
    // Сигналы
    signals,
    avgBuyProfit,
    avgBuyPct,
    avgSellProfit,
    avgSellPct,
    // Arb data
    groupsCount: arbResult.groupsCount ?? 0,
    storeStepsCount: pairsToQuote.length,
    resultsCount: allResults.length,
    allResults,
    profitableResults: arbResult.profitableResults ?? [],
  };
}
