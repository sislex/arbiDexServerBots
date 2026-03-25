import { KucoinQuotesResult } from './types';

export function printQuotesTable(result: KucoinQuotesResult): void {
  if (!result.ok || !result.quote) {
    console.error(`\n❌ KuCoin ошибка: ${result.error}`);
    return;
  }

  const q = result.quote;

  console.log(`\n📊 KuCoin bookTicker  |  symbol: ${q.symbol}  |  latency: ${q.latencyMs} ms`);
  console.table([
    { metric: 'Bid (продать)', price: q.bidPrice.toFixed(2), qty: q.bidQty },
    { metric: 'Ask (купить)',  price: q.askPrice.toFixed(2), qty: q.askQty },
    { metric: 'Mid',           price: q.midPrice.toFixed(2), qty: '—' },
    { metric: 'Spread',        price: q.spread.toFixed(4),   qty: `${q.spreadPct.toFixed(4)}%` },
  ]);
}

