import {ArbResult} from '../../../store/state.types';

export function printArbResults(label: string, results: ArbResult[]) {
  const profitable = results.filter(r => r.success && BigInt(r.profit) > 0n);
  // console.log(`\n--- ${label}: Арбитражные возможности ---`);
  if (profitable.length > 0) {
    for (const r of profitable) {
      console.log(`  ✅ buy [${r.buyIndex}] ${r.buyPair} → sell [${r.sellIndex}] ${r.sellPair}: profit=${r.profit}`);
    }
  } else {
    // console.log('  ❌ Прибыльных арбитражей не найдено');
    const sorted = [...results].filter(r => r.success).sort((a, b) => Number(BigInt(b.profit) - BigInt(a.profit)));
    // console.log('  Топ-3 ближайших:');
    // for (const r of sorted.slice(0, 3)) {
    //   console.log(`    buy [${r.buyIndex}] ${r.buyPair} → sell [${r.sellIndex}] ${r.sellPair}: profit=${r.profit}`);
    // }
  }
  return profitable;
}
