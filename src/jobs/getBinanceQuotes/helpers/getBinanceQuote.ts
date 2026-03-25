/**
 * Получает котировку bid/ask для пары с Binance Spot API.
 * bookTicker — самый быстрый endpoint (1 запрос, без ws).
 */

export interface BinanceQuote {
  symbol: string;       // "ETHUSDC"
  bidPrice: number;     // лучшая цена покупки (можно продать по ней)
  bidQty: number;
  askPrice: number;     // лучшая цена продажи (можно купить по ней)
  askQty: number;
  midPrice: number;     // (bid + ask) / 2
  spread: number;       // ask - bid
  spreadPct: number;    // spread / midPrice * 100
  latencyMs: number;
}

export async function getBinanceQuote({
                                        rpcUrl,
                                        symbol = 'ETHUSDC',
                                      }): Promise<BinanceQuote> {
  const start = performance.now();

  const url = `${rpcUrl}?symbol=${symbol}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Binance API error: ${res.status} ${res.statusText}`);
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


