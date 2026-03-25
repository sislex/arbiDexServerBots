// import 'dotenv/config';
// import {
//   getBestSellQuote, GetBestSellQuoteOpts,
//   TOKEN_PAIR
// } from '../jobs/getBestSellQuote/getBestSellQuote';
// import { IJobParams_get_Arbitrum_Arb_Executor_Quotes } from '../store/state.types';
// import { BotListFilteredUSDC } from '../store/stabs/bots-list.stabs';
//
// async function main() {
//   const jobParams: any = BotListFilteredUSDC[0].jobParams as IJobParams_get_Arbitrum_Arb_Executor_Quotes;
//
//   console.log(`\n📋 Конфигурация:`);
//   console.log(`  EXECUTOR_ADDRESS: ${process.env.EXECUTOR_ADDRESS ?? '❌ не задан'}`);
//   console.log(`  PRIVATE_KEY:      ${process.env.PRIVATE_KEY ? '✅ задан' : '❌ не задан'}`);
//   console.log(`  RPC:              ${jobParams.rpcUrl}`);
//   console.log(`  Пары токенов:`);
//   console.log(`    ${TOKEN_PAIR.tokenIn.address} → ${TOKEN_PAIR.tokenOut.address}`);
//   console.log(`  Всего пулов в конфиге: ${jobParams.pairsToQuote.length}`);
//
//   const opts: GetBestSellQuoteOpts = {
//     pair: TOKEN_PAIR,
//     consoleOutput: true,
//     executeReal: true,
//     maxFeePerGasGwei: 0.5,
//     maxPriorityFeePerGasGwei: 0.1,
//   };
//
//   const result = await getBestSellQuote(jobParams, opts);
//
//   if (!result.ok) {
//     console.error(`\n❌ Ошибка: ${result.error}`);
//     process.exit(1);
//   }
//
//   console.log(`\n${'═'.repeat(65)}`);
//   console.log('  📊 Результат getBestSellQuote');
//   console.log(`${'═'.repeat(65)}`);
//   console.log(`  Block:         ${result.blockNumber}`);
//   console.log(`  Latency:       ${result.latencyMs} ms`);
//   console.log(`  Контракт:      ${result.executorAddress}`);
//   if (result.tokens.length > 0) {
//     console.log(`  Токены:`);
//     for (const t of result.tokens) {
//       const mark = result.sellToken && t.address.toLowerCase() === result.sellToken.address.toLowerCase() ? ' ◀ продаём' : '';
//       console.log(`    ${t.symbol.padEnd(8)} ${t.formatted.padStart(22)}${mark}`);
//     }
//   }
//   console.log(`  Пулов (фильтр): ${result.filteredPairsCount}`);
//
//   if (result.allQuotes.length > 0) {
//     console.log(`\n  Котировки:`);
//     for (const q of result.allQuotes) {
//       const isBest = result.bestQuote && q.poolIndex === result.bestQuote.poolIndex;
//       const status = q.success ? '✅' : '❌';
//       console.log(`    [${q.poolIndex}] ${q.dex}-${q.version} ${status} → ${q.amountOutFormatted} ${result.bestQuote?.tokenOutSymbol ?? ''} (gas: ${q.gasUsed})${isBest ? ' ⭐ BEST' : ''}`);
//     }
//   }
//
//   if (result.bestQuote) {
//     console.log(`\n  🏆 Лучшая цена DEX: [${result.bestQuote.poolIndex}] ${result.bestQuote.dex}-${result.bestQuote.version}`);
//     console.log(`     ${result.sellToken!.formatted} ${result.sellToken!.symbol} → ${result.bestQuote.amountOutFormatted} ${result.bestQuote.tokenOutSymbol}`);
//   }
//
//   if (result.cexQuotes.length > 0 || result.bestQuote) {
//     console.log(`\n  Котировки (DEX + CEX):`);
//     if (result.bestQuote) {
//       const dexLabel = result.isReversed ? 'ask' : 'bid';
//       console.log(`    ${'DEX'.padEnd(10)} ${result.bestQuote.dex}-${result.bestQuote.version} [${result.bestQuote.poolIndex}]  ${dexLabel}: $${result.dexPrice.toFixed(2)}`);
//     }
//     for (const cex of result.cexQuotes) {
//       console.log(`    ${cex.name.padEnd(10)} ${cex.symbol}  bid: $${cex.bidPrice.toFixed(2)}  ask: $${cex.askPrice.toFixed(2)}  mid: $${cex.midPrice.toFixed(2)}  spread: ${cex.spreadPct.toFixed(4)}%  (${cex.latencyMs} ms)`);
//     }
//     if (result.cexQuotes.length > 0) {
//       console.log(`    ${'W-AVG CEX'.padEnd(10)} ${result.weightedAvgCexSymbol}  bid: $${result.weightedAvgCexBid.toFixed(2)}  ask: $${result.weightedAvgCexAsk.toFixed(2)}  mid: $${result.weightedAvgCexMid.toFixed(2)}  spread: ${result.weightedAvgCexSpreadPct.toFixed(4)}%  (${result.weightedAvgCexLatency} ms)`);
//     }
//   }
//
//   // Сигнал
//   const s = result.signal;
//   if (s.shouldSwapOnDex) {
//     console.log(`\n  🟢 СИГНАЛ: КУПИТЬ НА DEX  (CEX дороже на ${Math.abs(s.diffPct).toFixed(4)}%)`);
//   } else {
//     console.log(`\n  🔴 НЕТ СИГНАЛА  (diff: ${s.diffPct >= 0 ? '+' : ''}${s.diffPct.toFixed(4)}%)`);
//   }
//   console.log(`     ${s.reason}`);
//
//   // Симуляция свопа
//   const sim = result.simulation;
//   if (sim.executed) {
//     console.log(`\n  ${'─'.repeat(60)}`);
//     console.log(`  🧪 Симуляция свопа:`);
//     if (sim.ok) {
//       console.log(`     ✅ OK (${sim.latencyMs} ms)`);
//       console.log(`     block: ${sim.blockNumber}, gas: ${sim.gasUsed}`);
//       console.log(`     amountIn:     ${result.sellToken!.formatted} ${result.sellToken!.symbol}`);
//       console.log(`     amountOut:    ${sim.amountOutFormatted} ${result.bestQuote?.tokenOutSymbol ?? ''}`);
//       console.log(`     amountOutMin: ${sim.amountOutMinFormatted} ${result.bestQuote?.tokenOutSymbol ?? ''} (slippage: ${(sim.slippageBps ?? 0) / 100}%)`);
//       const simPriceLabel = result.isReversed ? (result.bestQuote?.tokenOutSymbol ?? '') : result.sellToken!.symbol;
//       console.log(`     💰 Цена: 1 ${simPriceLabel} = $${sim.pricePerToken?.toFixed(2)}`);
//     } else {
//       console.log(`     ❌ FAILED (${sim.latencyMs} ms): ${sim.error}`);
//     }
//   } else if (!s.shouldSwapOnDex) {
//     console.log(`\n  ⏸️  Симуляция не запущена (нет сигнала)`);
//   }
//
//   // Реальный своп
//   const rs = result.realSwap;
//   if (rs.executed) {
//     console.log(`\n  ${'─'.repeat(60)}`);
//     console.log(`  💰 Реальный своп:`);
//     if (rs.ok) {
//       console.log(`     ✅ SUCCESS (${rs.latencyMs} ms)`);
//       if (rs.txHash) console.log(`     txHash: ${rs.txHash}`);
//       if (rs.blockNumber) console.log(`     block: ${rs.blockNumber}`);
//       if (rs.gasUsed) console.log(`     gas: ${rs.gasUsed}`);
//       if (rs.amountOutFormatted) console.log(`     amountOut: ${rs.amountOutFormatted} ${result.bestQuote?.tokenOutSymbol ?? ''}`);
//     } else {
//       console.log(`     ❌ FAILED (${rs.latencyMs} ms)`);
//       if (rs.txHash) console.log(`     txHash: ${rs.txHash}`);
//       if (rs.error) console.log(`     error: ${rs.error}`);
//     }
//   } else if (rs.skipped) {
//     console.log(`\n  ⏸️  Реальный своп: ${rs.reason}`);
//   }
//
//   console.log(`\n✅ Готово (${result.latencyMs} ms)`);
// }
//
// main().catch(console.error);
//
