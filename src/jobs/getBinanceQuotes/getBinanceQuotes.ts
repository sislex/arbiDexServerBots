import {
  IJobParams_get_Cex_Quotes,
} from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getBinanceQuote } from './helpers/getBinanceQuote';
import { BinanceQuotesResult } from './helpers/types';
import {cexToUnified, printUnifiedQuotesTable, priceStore} from '../shared';

// ── Джоба ────────────────────────────────────────────────────

export async function getBinanceQuotes(
  params: IJobParams_get_Cex_Quotes,
): Promise<BinanceQuotesResult> {
  const {
    source,
    symbol = 'ETHUSDC',
  } = params;

  try {
    const quote = await getBinanceQuote(symbol);

    const result: BinanceQuotesResult = {
      ok: true,
      latencyMs: quote.latencyMs,
      quote,
    };
    result.unified = cexToUnified(source, result, symbol);
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
    result.unified = cexToUnified(source, result, symbol);

    printQuotesTable(result);

    return result;
  }
}
