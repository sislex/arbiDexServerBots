/**
 * Получает котировку bid/ask для пары с OKX Spot API (v5).
 */

export interface OkxQuote {
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

export async function getOkxQuote(token0: string, token1: string): Promise<OkxQuote> {
  const symbol = `${token0}-${token1}`;
  const start = performance.now();

  const url = `https://www.okx.com/api/v5/market/ticker?instId=${symbol}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`OKX API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const latencyMs = Math.round(performance.now() - start);

  if (json.code !== '0' || !json.data?.[0]) {
    throw new Error(`OKX API: code=${json.code}, msg=${json.msg}`);
  }

  const ticker = json.data[0];
  const bidPrice = parseFloat(ticker.bidPx);
  const askPrice = parseFloat(ticker.askPx);
  const midPrice = (bidPrice + askPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = (spread / midPrice) * 100;

  return {
    symbol,
    bidPrice,
    bidQty: parseFloat(ticker.bidSz),
    askPrice,
    askQty: parseFloat(ticker.askSz),
    midPrice,
    spread,
    spreadPct,
    latencyMs,
  };
}

