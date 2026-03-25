/**
 * Получает котировку bid/ask для пары с MEXC Spot API.
 * Формат идентичен Binance — bookTicker.
 * MEXC не имеет ETHUSDC, используем ETHUSDT.
 */

export interface MexcQuote {
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

export async function getMexcQuote(symbol = 'ETHUSDT'): Promise<MexcQuote> {
  const start = performance.now();

  const url = `https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${symbol}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`MEXC API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const latencyMs = Math.round(performance.now() - start);

  const bidPrice = parseFloat(data.bidPrice);
  const askPrice = parseFloat(data.askPrice);
  const midPrice = (bidPrice + askPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = (spread / midPrice) * 100;

  return {
    symbol,
    bidPrice,
    bidQty: parseFloat(data.bidQty),
    askPrice,
    askQty: parseFloat(data.askQty),
    midPrice,
    spread,
    spreadPct,
    latencyMs,
  };
}

