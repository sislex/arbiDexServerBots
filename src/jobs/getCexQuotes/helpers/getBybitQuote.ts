/**
 * Получает котировку bid/ask для пары с Bybit Spot API (v5).
 * Пробует несколько доменов (api.bybit.com, api.bytick.com).
 */

export interface BybitQuote {
  symbol: string;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  midPrice: number;
  spread: number;
  spreadPct: number;
  latencyMs: number;
}

const BYBIT_HOSTS = [
  'https://api.bybit.com',
  'https://api.bytick.com',
];

export async function getBybitQuote(token0: string, token1: string): Promise<BybitQuote> {
  const symbol = `${token0}${token1}`;
  const start = performance.now();

  let lastError: Error | null = null;

  for (const host of BYBIT_HOSTS) {
    try {
      const url = `${host}/v5/market/tickers?category=spot&symbol=${symbol}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        lastError = new Error(`Bybit API (${host}) error: ${res.status} ${res.statusText}`);
        continue;
      }

      const json = await res.json();
      const latencyMs = Math.round(performance.now() - start);

      if (json.retCode !== 0 || !json.result?.list?.[0]) {
        lastError = new Error(`Bybit API (${host}): retCode=${json.retCode}, msg=${json.retMsg}`);
        continue;
      }

      const ticker = json.result.list[0];
      const bidPrice = parseFloat(ticker.bid1Price);
      const askPrice = parseFloat(ticker.ask1Price);
      const midPrice = (bidPrice + askPrice) / 2;
      const spread = askPrice - bidPrice;
      const spreadPct = (spread / midPrice) * 100;

      return {
        symbol,
        bidPrice,
        bidQty: parseFloat(ticker.bid1Size),
        askPrice,
        askQty: parseFloat(ticker.ask1Size),
        midPrice,
        spread,
        spreadPct,
        latencyMs,
      };
    } catch (e: any) {
      lastError = e;
      continue;
    }
  }

  throw lastError ?? new Error('Bybit API: all hosts unreachable');
}

