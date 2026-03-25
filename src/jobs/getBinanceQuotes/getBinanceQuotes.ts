import {
  IJobParams_get_Binance_Quotes,
} from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getBinanceQuote } from './helpers/getBinanceQuote';
import { BinanceQuotesResult } from './helpers/types';

// ── Джоба ────────────────────────────────────────────────────

export async function getBinanceQuotes(
  params: IJobParams_get_Binance_Quotes,
): Promise<BinanceQuotesResult> {
  const {
    rpcUrl = 'https://data-api.binance.vision/api/v3/ticker/bookTicker',
    symbol = 'ETHUSDC',
  } = params;

  try {
    const quote = await getBinanceQuote({ rpcUrl, symbol });

    const result: BinanceQuotesResult = {
      ok: true,
      latencyMs: quote.latencyMs,
      quote,
    };

    printQuotesTable(result);

    return result;
  } catch (err: any) {
    const result: BinanceQuotesResult = {
      ok: false,
      latencyMs: 0,
      error: err.message ?? String(err),
      quote: null,
    };

    printQuotesTable(result);

    return result;
  }
}
