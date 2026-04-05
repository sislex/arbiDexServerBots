import 'dotenv/config';
import { getArbViaScanPairs, getArbViaFindArb, getArbViaFindArbStore } from '../jobs/getQuoteFromArbExecutor/getArbExecutor.quotes';
import { IJobType, IQuote } from '../store/state.types';
import { BotList10 } from '../store/stabs/bots-list.stabs';

let pairsToQuote: IQuote[] = [];
if (BotList10[1].jobParams.jobType === IJobType.GET_ARB_EXECUTOR_QUOTES) {
  pairsToQuote = BotList10[1].jobParams.pairsToQuote;
}

const jobParams = {
  jobType: IJobType.GET_ARB_EXECUTOR_QUOTES as const,
  rpcUrl: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
  pairsToQuote,
};

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Запуск трёх вариантов ПАРАЛЛЕЛЬНО');
  console.log(`${'='.repeat(60)}\n`);

  const [scanPairsResult, findArbResult, findArbStoreResult] = await Promise.all([
    getArbViaScanPairs(jobParams),
    getArbViaFindArb(jobParams),
    getArbViaFindArbStore(jobParams),
  ]);

  // ── Сравнение метрик ──
  console.log(`\n${'='.repeat(60)}`);
  console.log('  СРАВНЕНИЕ МЕТРИК');
  console.log(`${'='.repeat(60)}\n`);

  const sp = scanPairsResult;
  const fa = findArbResult;
  const fs = findArbStoreResult;

  console.table([
    {
      method:       'scanPairs (quoteBuys + scan)',
      totalMs:      `${sp.latencyMs} ms`,
      rpcCalls:     '2 (quoteBuysDirect + scanArbPairsDirect)',
      arbPairs:     sp.arbPairsCount ?? '-',
      results:      sp.resultsCount ?? '-',
      profitable:   sp.profitableResults?.length ?? 0,
      blockNumber:  sp.blockNumber,
    },
    {
      method:       'findArb (всё в контракте)',
      totalMs:      `${fa.latencyMs} ms`,
      rpcCalls:     '1 (findArbDirect)',
      arbPairs:     '-',
      results:      fa.resultsCount ?? '-',
      profitable:   fa.profitableResults?.length ?? 0,
      blockNumber:  fa.blockNumber,
    },
    {
      method:       `findArbStore (key=${fs.storeKey})`,
      totalMs:      `${fs.latencyMs} ms`,
      rpcCalls:     '1 (findArb)',
      arbPairs:     '-',
      results:      fs.resultsCount ?? '-',
      profitable:   fs.profitableResults?.length ?? 0,
      blockNumber:  fs.blockNumber,
    },
  ]);

  // Детальное сравнение шагов
  console.log('\nДетальные метрики по шагам:');
  console.log('\n  scanPairs:');
  for (const m of sp.metrics) {
    console.log(`    ${m.step.padEnd(35)} ${String(m.ms).padStart(6)} ms`);
  }
  console.log(`\n  findArb:`);
  for (const m of fa.metrics) {
    console.log(`    ${m.step.padEnd(35)} ${String(m.ms).padStart(6)} ms`);
  }
  console.log(`\n  findArbStore:`);
  for (const m of fs.metrics) {
    console.log(`    ${m.step.padEnd(35)} ${String(m.ms).padStart(6)} ms`);
  }

  const times = [
    { name: 'scanPairs', ms: sp.latencyMs },
    { name: 'findArb', ms: fa.latencyMs },
    { name: 'findArbStore', ms: fs.latencyMs },
  ].sort((a, b) => a.ms - b.ms);
  console.log(`\n  🏆 Быстрее: ${times[0].name} (${times[0].ms} ms), затем ${times[1].name} (${times[1].ms} ms), затем ${times[2].name} (${times[2].ms} ms)\n`);

  // ── Детальное сравнение пар ──
  console.log(`${'='.repeat(60)}`);
  console.log('  СРАВНЕНИЕ ПАР (findArb profitable → та же пара в scanPairs)');
  console.log(`${'='.repeat(60)}\n`);

  // Создаём индекс scanPairs по ключу "buyIndex|sellIndex"
  const spByKey = new Map<string, any>();
  for (const r of (sp.allResults ?? [])) {
    spByKey.set(`${r.buyIndex}|${r.sellIndex}`, r);
  }

  // Создаём индекс findArb по ключу
  const faByKey = new Map<string, any>();
  for (const r of (fa.allResults ?? [])) {
    faByKey.set(`${r.buyIndex}|${r.sellIndex}`, r);
  }

  // Создаём индекс findArbStore по ключу
  const fsByKey = new Map<string, any>();
  for (const r of (fs.allResults ?? [])) {
    fsByKey.set(`${r.buyIndex}|${r.sellIndex}`, r);
  }

  // 1) Показываем прибыльные из findArb и аналог из scanPairs
  const faProfitable = (fa.allResults ?? []).filter((r: any) => r.success && BigInt(r.profit) > 0n);

  if (faProfitable.length > 0) {
    console.log(`findArb нашёл ${faProfitable.length} прибыльных пар:\n`);
    for (const faR of faProfitable) {
      const key = `${faR.buyIndex}|${faR.sellIndex}`;
      const spR = spByKey.get(key);

      console.log(`  Пара: buy [${faR.buyIndex}] ${faR.buyPair} → sell [${faR.sellIndex}] ${faR.sellPair}`);
      console.log(`  ┌──────────────────┬──────────────────────────┬──────────────────────────┐`);
      console.log(`  │                  │ findArb                  │ scanPairs                │`);
      console.log(`  ├──────────────────┼──────────────────────────┼──────────────────────────┤`);
      console.log(`  │ profit           │ ${String(faR.profit).padEnd(24)} │ ${spR ? String(spR.profit).padEnd(24) : '--- НЕТ ЭТОЙ ПАРЫ ---'.padEnd(24)} │`);
      console.log(`  │ buyAmountOut     │ ${String(faR.buyAmountOut).padEnd(24)} │ ${spR ? String(spR.buyAmountOut).padEnd(24) : '-'.padEnd(24)} │`);
      console.log(`  │ sellAmountOut    │ ${String(faR.sellAmountOut).padEnd(24)} │ ${spR ? String(spR.sellAmountOut).padEnd(24) : '-'.padEnd(24)} │`);
      console.log(`  │ gasUsed          │ ${String(faR.gasUsed).padEnd(24)} │ ${spR ? String(spR.gasUsed).padEnd(24) : '-'.padEnd(24)} │`);
      console.log(`  │ success          │ ${String(faR.success).padEnd(24)} │ ${spR ? String(spR.success).padEnd(24) : '-'.padEnd(24)} │`);
      console.log(`  └──────────────────┴──────────────────────────┴──────────────────────────┘`);

      if (!spR) {
        console.log(`  ⚠️  scanPairs НЕ СОДЕРЖИТ эту пару! (возможно другой bestBuy выбран)`);
      } else if (faR.buyAmountOut !== spR.buyAmountOut) {
        console.log(`  ⚠️  РАЗНЫЕ buyAmountOut → контракт и сервер выбрали РАЗНЫЙ bestBuy!`);
      }
      console.log('');
    }
  } else {
    console.log('findArb не нашёл прибыльных пар.\n');
  }

  // 2) Показываем прибыльные из scanPairs (если есть) и аналог из findArb
  const spProfitable = (sp.allResults ?? []).filter((r: any) => r.success && BigInt(r.profit) > 0n);

  if (spProfitable.length > 0) {
    console.log(`scanPairs нашёл ${spProfitable.length} прибыльных пар:\n`);
    for (const spR of spProfitable) {
      const key = `${spR.buyIndex}|${spR.sellIndex}`;
      const faR = faByKey.get(key);
      console.log(`  Пара: buy [${spR.buyIndex}] ${spR.buyPair} → sell [${spR.sellIndex}] ${spR.sellPair}`);
      console.log(`    scanPairs: profit=${spR.profit}, buyOut=${spR.buyAmountOut}, sellOut=${spR.sellAmountOut}`);
      console.log(`    findArb:   ${faR ? `profit=${faR.profit}, buyOut=${faR.buyAmountOut}, sellOut=${faR.sellAmountOut}` : 'НЕТ ЭТОЙ ПАРЫ'}`);
      console.log('');
    }
  }

  // 3) Общая сводка: пары с разными результатами
  console.log(`${'─'.repeat(60)}`);
  console.log('  Расхождения по общим парам:');
  console.log(`${'─'.repeat(60)}`);

  let diffCount = 0;
  for (const [key, faR] of faByKey) {
    const spR = spByKey.get(key);
    if (!spR) continue;
    const faProfitBig = BigInt(faR.profit);
    const spProfitBig = BigInt(spR.profit);
    const delta = faProfitBig - spProfitBig;
    if (delta !== 0n) {
      diffCount++;
      if (diffCount <= 5) { // показываем первые 5
        console.log(`  [${faR.buyIndex}→${faR.sellIndex}] ${faR.buyPair}→${faR.sellPair}: findArb=${faR.profit} vs scanPairs=${spR.profit} (Δ=${delta.toString()})`);
      }
    }
  }
  if (diffCount > 5) console.log(`  ... и ещё ${diffCount - 5} расхождений`);
  if (diffCount === 0) console.log('  Все общие пары совпадают ✅');

  // Пары которые есть только в одном методе
  const onlyInFindArb = [...faByKey.keys()].filter(k => !spByKey.has(k));
  const onlyInScanPairs = [...spByKey.keys()].filter(k => !faByKey.has(k));

  if (onlyInFindArb.length > 0) {
    console.log(`\n  Пары только в findArb (${onlyInFindArb.length}):`);
    for (const key of onlyInFindArb) {
      const r = faByKey.get(key)!;
      console.log(`    [${r.buyIndex}→${r.sellIndex}] ${r.buyPair}→${r.sellPair}: profit=${r.profit}`);
    }
  }
  if (onlyInScanPairs.length > 0) {
    console.log(`\n  Пары только в scanPairs (${onlyInScanPairs.length}):`);
    for (const key of onlyInScanPairs) {
      const r = spByKey.get(key)!;
      console.log(`    [${r.buyIndex}→${r.sellIndex}] ${r.buyPair}→${r.sellPair}: profit=${r.profit}`);
    }
  }

  // ── findArb vs findArbStore ──
  console.log(`\n${'─'.repeat(60)}`);
  console.log('  findArb vs findArbStore:');
  console.log(`${'─'.repeat(60)}`);

  let fsVsFaDiffCount = 0;
  for (const [key, faR] of faByKey) {
    const fsR = fsByKey.get(key);
    if (!fsR) continue;
    const delta = BigInt(faR.profit) - BigInt(fsR.profit);
    if (delta !== 0n) {
      fsVsFaDiffCount++;
      if (fsVsFaDiffCount <= 5) {
        console.log(`  [${faR.buyIndex}→${faR.sellIndex}] ${faR.buyPair}→${faR.sellPair}: findArb=${faR.profit} vs store=${fsR.profit} (Δ=${delta.toString()})`);
      }
    }
  }
  if (fsVsFaDiffCount > 5) console.log(`  ... и ещё ${fsVsFaDiffCount - 5} расхождений`);
  if (fsVsFaDiffCount === 0) console.log('  findArb и findArbStore полностью совпадают ✅');

  const onlyInStore = [...fsByKey.keys()].filter(k => !faByKey.has(k));
  const onlyInDirect = [...faByKey.keys()].filter(k => !fsByKey.has(k));
  if (onlyInStore.length > 0) {
    console.log(`\n  Пары только в findArbStore (${onlyInStore.length}):`);
    for (const key of onlyInStore.slice(0, 5)) {
      const r = fsByKey.get(key)!;
      console.log(`    [${r.buyIndex}→${r.sellIndex}] ${r.buyPair}→${r.sellPair}: profit=${r.profit}`);
    }
  }
  if (onlyInDirect.length > 0) {
    console.log(`\n  Пары только в findArbDirect (${onlyInDirect.length}):`);
    for (const key of onlyInDirect.slice(0, 5)) {
      const r = faByKey.get(key)!;
      console.log(`    [${r.buyIndex}→${r.sellIndex}] ${r.buyPair}→${r.sellPair}: profit=${r.profit}`);
    }
  }

  console.log('');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
