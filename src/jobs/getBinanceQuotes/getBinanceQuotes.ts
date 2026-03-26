import {
  IJobParams_get_Binance_Quotes,
} from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getBinanceQuote } from './helpers/getBinanceQuote';
import { BinanceQuotesResult } from './helpers/types';
import {cexToUnified, printUnifiedQuotesTable, priceStore} from '../shared';

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
    result.unified = cexToUnified('binance', result, symbol);
    priceStore.recordQuote(result.unified);
    // printUnifiedQuotesTable(result.unified);

    return result;
  } catch (err: any) {
    const result: BinanceQuotesResult = {
      ok: false,
      latencyMs: 0,
      error: err.message ?? String(err),
      quote: null,
    };
    result.unified = cexToUnified('binance', result, symbol);

    printQuotesTable(result);

    return result;
  }
}
