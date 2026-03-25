import { IJobParams_get_Kucoin_Quotes } from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getKucoinQuote } from './helpers/getKucoinQuote';
import { KucoinQuotesResult } from './helpers/types';

export async function getKucoinQuotes(
  params: IJobParams_get_Kucoin_Quotes,
): Promise<KucoinQuotesResult> {
  const { symbol = 'ETH-USDT' } = params;

  try {
    const quote = await getKucoinQuote(symbol);
    const result: KucoinQuotesResult = { ok: true, latencyMs: quote.latencyMs, quote };
    printQuotesTable(result);
    return result;
  } catch (err: any) {
    const result: KucoinQuotesResult = { ok: false, latencyMs: 0, error: err.message ?? String(err), quote: null };
    printQuotesTable(result);
    return result;
  }
}

