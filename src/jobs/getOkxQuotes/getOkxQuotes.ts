import { IJobParams_get_Okx_Quotes } from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getOkxQuote } from './helpers/getOkxQuote';
import { OkxQuotesResult } from './helpers/types';

export async function getOkxQuotes(
  params: IJobParams_get_Okx_Quotes,
): Promise<OkxQuotesResult> {
  const { symbol = 'ETH-USDT' } = params;

  try {
    const quote = await getOkxQuote(symbol);
    const result: OkxQuotesResult = { ok: true, latencyMs: quote.latencyMs, quote };
    printQuotesTable(result);
    return result;
  } catch (err: any) {
    const result: OkxQuotesResult = { ok: false, latencyMs: 0, error: err.message ?? String(err), quote: null };
    printQuotesTable(result);
    return result;
  }
}

