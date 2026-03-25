import { IJobParams_get_Gateio_Quotes } from '../../store/state.types';
import { printQuotesTable } from './helpers/printQuotesTable';
import { getGateioQuote } from './helpers/getGateioQuote';
import { GateioQuotesResult } from './helpers/types';

export async function getGateioQuotes(
  params: IJobParams_get_Gateio_Quotes,
): Promise<GateioQuotesResult> {
  const { symbol = 'ETH_USDT' } = params;

  try {
    const quote = await getGateioQuote(symbol);
    const result: GateioQuotesResult = { ok: true, latencyMs: quote.latencyMs, quote };
    printQuotesTable(result);
    return result;
  } catch (err: any) {
    const result: GateioQuotesResult = { ok: false, latencyMs: 0, error: err.message ?? String(err), quote: null };
    printQuotesTable(result);
    return result;
  }
}

