import { DexQuotesByArbQuoteResult, ITokenPair } from './types';

export interface PrintQuotesTableOpts {
  tokenPair: ITokenPair;
  humanReadable: boolean;
}

/**
 * Выводит результат getDexQuotesByArbQuoter в консоль:
 * таблицу с ценами, bestBuy/bestSell, latency.
 */
export function printQuotesTable(
  result: DexQuotesByArbQuoteResult,
  opts: PrintQuotesTableOpts,
): void {
  if (!result.ok) {
    console.error(`\n❌ Ошибка: ${result.error}`);
    return;
  }

  const { tokenPair, humanReadable } = opts;
  const inSym  = tokenPair.tokenIn.symbol;
  const outSym = tokenPair.tokenOut.symbol;
  const priceFmt = humanReadable ? 2 : 0;

  const rows = result.allQuotes.map((q) => ({
    dex: q.dex,
    version: q.version,
    fee: q.feePpm ?? '—',
    [`buyPrice (1 ${outSym})`]:
      q.buySuccess ? `${q.buyPrice.toFixed(priceFmt)} ${inSym}` : '❌ failed',
    [`sellPrice (1 ${outSym})`]:
      q.sellSuccess ? `${q.sellPrice.toFixed(priceFmt)} ${inSym}` : '❌ failed',
  }));

  console.log(`\n📊 ArbQuoter quoteExactInBatch  |  block: ${result.blockNumber}  |  gasUsed: ${result.allQuotes[0]?.gasUsed ?? '—'}`);
  console.table(rows);

  console.log(`\n✅ Готово за ${result.latencyMs} ms  |  block: ${result.blockNumber}`);

  if (result.bestBuy) {
    console.log(`🏆 Best Buy:  ${result.bestBuy.dex} ${result.bestBuy.version} (fee ${result.bestBuy.feePpm ?? '—'}) → buyPrice ${result.bestBuy.buyPrice.toFixed(priceFmt)} ${inSym}`);
  }
  if (result.bestSell) {
    console.log(`🏆 Best Sell: ${result.bestSell.dex} ${result.bestSell.version} (fee ${result.bestSell.feePpm ?? '—'}) → sellPrice ${result.bestSell.sellPrice.toFixed(priceFmt)} ${inSym}`);
  }
}

