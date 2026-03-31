import { UnifiedQuoteResult } from './types';

/**
 * Выводит массив UnifiedQuoteResult в виде таблицы в консоль.
 * Если передан один результат — оборачивает в массив.
 */
export function printUnifiedQuotesTable(
  results: UnifiedQuoteResult | UnifiedQuoteResult[],
): void {
  const list = Array.isArray(results) ? results : [results];

  if (list.length === 0) {
    console.log('\n⚠️  Нет котировок для отображения');
    return;
  }

  const rows = list.map((r) => {
    if (!r.ok) {
      return {
        source: r.source,
        pair: `${r.token0}/${r.token1}`,
        bid: '❌',
        ask: '❌',
        mid: '❌',
        spread: r.error ?? 'error',
        'spread%': '—',
        'ms': r.latencyMs,
      };
    }

    return {
      source: r.source,
      pair: `${r.token0}/${r.token1}`,
      bid: r.bidPrice.toFixed(2),
      ask: r.askPrice.toFixed(2),
      mid: r.midPrice.toFixed(2),
      spread: r.spread.toFixed(4),
      'spread%': `${r.spreadPct.toFixed(4)}%`,
      'ms': r.latencyMs,
    };
  });

  console.log('\n📊 Unified Quotes:');
  console.table(rows);

  // Лучшие bid/ask среди успешных
  const okResults = list.filter((r) => r.ok && r.bidPrice > 0 && r.askPrice > 0);
  if (okResults.length > 1) {
    const bestBid = okResults.reduce((a, b) => (b.bidPrice > a.bidPrice ? b : a));
    const bestAsk = okResults.reduce((a, b) => (b.askPrice < a.askPrice ? b : a));

    console.log(`  🏆 Best Bid (продать): ${bestBid.source} → ${bestBid.bidPrice.toFixed(2)}`);
    console.log(`  🏆 Best Ask (купить):  ${bestAsk.source} → ${bestAsk.askPrice.toFixed(2)}`);

    if (bestBid.bidPrice > bestAsk.askPrice) {
      const profitPct = ((bestBid.bidPrice - bestAsk.askPrice) / bestAsk.askPrice * 100).toFixed(4);
      console.log(`  🔥 Арбитраж: купить на ${bestAsk.source} по ${bestAsk.askPrice.toFixed(2)}, продать на ${bestBid.source} по ${bestBid.bidPrice.toFixed(2)} (+${profitPct}%)`);
    }
  }
}

