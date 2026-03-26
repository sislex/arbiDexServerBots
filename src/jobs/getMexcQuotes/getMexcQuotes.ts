import {
  IJobParams_get_Mexc_Quotes,
} from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getMexcQuote } from './helpers/getMexcQuote';
import { MexcQuotesResult } from './helpers/types';
import {cexToUnified, printUnifiedQuotesTable, priceStore} from '../shared';

// ── Джоба ────────────────────────────────────────────────────

export async function getMexcQuotes(
  params: IJobParams_get_Mexc_Quotes,
): Promise<MexcQuotesResult> {
  const {
    symbol = 'ETHUSDT',
  } = params;

  try {
    const quote = await getMexcQuote(symbol);

    const result: MexcQuotesResult = {
      ok: true,
      latencyMs: quote.latencyMs,
      quote,
    };
    result.unified = cexToUnified('mexc', result, symbol);
    priceStore.recordQuote(result.unified);
    // printUnifiedQuotesTable(result.unified);
    return result;
  } catch (err: any) {
    const result: MexcQuotesResult = {
      ok: false,
      latencyMs: 0,
      error: err.message ?? String(err),
      quote: null,
    };
    result.unified = cexToUnified('mexc', result, symbol);

    printQuotesTable(result);

    return result;
  }
}

