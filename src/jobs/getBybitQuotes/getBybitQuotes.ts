import {
  IJobParams_get_Bybit_Quotes,
} from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getBybitQuote } from './helpers/getBybitQuote';
import { BybitQuotesResult } from './helpers/types';
import {cexToUnified, printUnifiedQuotesTable, priceStore} from '../shared';

// ── Джоба ────────────────────────────────────────────────────

export async function getBybitQuotes(
  params: IJobParams_get_Bybit_Quotes,
): Promise<BybitQuotesResult> {
  const {
    symbol = 'ETHUSDT',
  } = params;

  try {
    const quote = await getBybitQuote(symbol);

    const result: BybitQuotesResult = {
      ok: true,
      latencyMs: quote.latencyMs,
      quote,
    };
    result.unified = cexToUnified('bybit', result, symbol);
    priceStore.recordQuote(result.unified);
    // printUnifiedQuotesTable(result.unified);
    return result;
  } catch (err: any) {
    const result: BybitQuotesResult = {
      ok: false,
      latencyMs: 0,
      error: err.message ?? String(err),
      quote: null,
    };
    result.unified = cexToUnified('bybit', result, symbol);

    printQuotesTable(result);

    return result;
  }
}

