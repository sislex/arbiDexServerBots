/**
 * Получает котировку bid/ask для пары с KuCoin Spot API.
 * Endpoint level1 — лучший bid/ask без авторизации.
 */

export interface KucoinQuote {
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

export async function getKucoinQuote(token0: string, token1: string): Promise<KucoinQuote> {
  const symbol = `${token0}-${token1}`;
  const start = performance.now();

  const url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`KuCoin API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const latencyMs = Math.round(performance.now() - start);

  if (json.code !== '200000' || !json.data) {
    throw new Error(`KuCoin API: code=${json.code}, msg=${json.msg}`);
  }

  const d = json.data;
  const bidPrice = parseFloat(d.bestBid);
  const askPrice = parseFloat(d.bestAsk);
  const midPrice = (bidPrice + askPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = (spread / midPrice) * 100;

  return {
    symbol,
    bidPrice,
    bidQty: parseFloat(d.bestBidSize),
    askPrice,
    askQty: parseFloat(d.bestAskSize),
    midPrice,
    spread,
    spreadPct,
    latencyMs,
  };
}

