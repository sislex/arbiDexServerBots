/**
 * Получает котировку bid/ask для пары с Gate.io Spot API v4.
 */

export interface GateioQuote {
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

export async function getGateioQuote(symbol = 'ETH_USDT'): Promise<GateioQuote> {
  const start = performance.now();

  const url = `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${symbol}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Gate.io API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const latencyMs = Math.round(performance.now() - start);

  if (!Array.isArray(json) || json.length === 0) {
    throw new Error(`Gate.io API: empty response for ${symbol}`);
  }

  const ticker = json[0];
  const bidPrice = parseFloat(ticker.highest_bid);
  const askPrice = parseFloat(ticker.lowest_ask);
  const midPrice = (bidPrice + askPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = (spread / midPrice) * 100;

  return {
    symbol,
    bidPrice,
    bidQty: parseFloat(ticker.base_volume ?? '0'),
    askPrice,
    askQty: parseFloat(ticker.quote_volume ?? '0'),
    midPrice,
    spread,
    spreadPct,
    latencyMs,
  };
}

