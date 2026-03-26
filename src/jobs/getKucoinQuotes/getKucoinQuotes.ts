import { IJobParams_get_Kucoin_Quotes } from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getKucoinQuote } from './helpers/getKucoinQuote';
import { KucoinQuotesResult } from './helpers/types';
import {cexToUnified, printUnifiedQuotesTable, priceStore} from '../shared';

export async function getKucoinQuotes(
  params: IJobParams_get_Kucoin_Quotes,
): Promise<KucoinQuotesResult> {
  const { symbol = 'ETH-USDT' } = params;

  try {
    const quote = await getKucoinQuote(symbol);
    const result: KucoinQuotesResult = { ok: true, latencyMs: quote.latencyMs, quote };
    result.unified = cexToUnified('kucoin', result, symbol);
    priceStore.recordQuote(result.unified);
    // printQuotesTable(result);
    // printUnifiedQuotesTable(result.unified);
    return result;
  } catch (err: any) {
    const result: KucoinQuotesResult = { ok: false, latencyMs: 0, error: err.message ?? String(err), quote: null };
    result.unified = cexToUnified('kucoin', result, symbol);
    printQuotesTable(result);
    return result;
  }
}

