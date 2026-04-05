/**
 * Получает котировку bid/ask для пары с Dzengi.com Spot API (v2).
 *
 * Dzengi не имеет bookTicker endpoint — используем ticker/24hr,
 * который возвращает bidPrice и askPrice.
 *
 * Документация: https://apitradedoc.dzengi.com/swagger-ui.html
 * Base URL:     https://api-adapter.dzengi.com
 * Формат символа: "ETH/USDT" (через %2F в URL)
 *
 * Author: Aliaksei Razhnou
 */

import { CexQuote } from '../types';

const DZENGI_API_BASE = 'https://api-adapter.dzengi.com';

export async function getDzengiQuote(token0: string, token1: string): Promise<CexQuote> {
  const symbol = `${token0}/${token1}`;
  const start = performance.now();

  const url = `${DZENGI_API_BASE}/api/v2/ticker/24hr?symbol=${encodeURIComponent(symbol)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`Dzengi API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const latencyMs = Math.round(performance.now() - start);

  // Dzengi может вернуть ошибку вида { code: -1128, msg: "symbol not found" }
  if (data.code && data.code < 0) {
    throw new Error(`Dzengi API: ${data.msg ?? `code ${data.code}`}`);
  }

  if (data.bidPrice === undefined || data.askPrice === undefined) {
    throw new Error(`Dzengi API: no price data for ${symbol}`);
  }

  const bidPrice = parseFloat(data.bidPrice);
  const askPrice = parseFloat(data.askPrice);

  if (isNaN(bidPrice) || isNaN(askPrice) || bidPrice <= 0 || askPrice <= 0) {
    throw new Error(
      `Dzengi API: invalid prices for ${symbol} (bid=${data.bidPrice}, ask=${data.askPrice})`,
    );
  }

  const midPrice = (bidPrice + askPrice) / 2;
  const spread = askPrice - bidPrice;
  const spreadPct = (spread / midPrice) * 100;

  return {
    symbol,
    bidPrice,
    bidQty: parseFloat(data.lastQty ?? '0'),
    askPrice,
    askQty: parseFloat(data.lastQty ?? '0'),
    midPrice,
    spread,
    spreadPct,
    latencyMs,
  };
}

