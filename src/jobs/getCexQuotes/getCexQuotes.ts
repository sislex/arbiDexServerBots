import { IJobParams_get_Cex_Quotes, CexSourceName } from '../../store/state.types';
import { CexQuote, CexQuotesResult } from './types';
import { printCexQuotesTable } from './printCexQuotesTable';
import { cexToUnified, marketDataClient } from '../shared';

import { getBinanceQuote } from './helpers/getBinanceQuote';
import { getMexcQuote }    from './helpers/getMexcQuote';
import { getBybitQuote }   from './helpers/getBybitQuote';
import { getOkxQuote }     from './helpers/getOkxQuote';
import { getKucoinQuote }  from './helpers/getKucoinQuote';
import { getGateioQuote }  from './helpers/getGateioQuote';
import { getDzengiQuote }  from './helpers/getDzengiQuote';

// ── Маппинг source → fetchQuote(token0, token1) ────────

interface CexConfig {
  fetchQuote: (token0: string, token1: string) => Promise<CexQuote>;
}

const cexConfigs: Record<CexSourceName, CexConfig> = {
  binance: { fetchQuote: getBinanceQuote },
  mexc:    { fetchQuote: getMexcQuote },
  bybit:   { fetchQuote: getBybitQuote },
  okx:     { fetchQuote: getOkxQuote },
  kucoin:  { fetchQuote: getKucoinQuote },
  gateio:  { fetchQuote: getGateioQuote },
  dzengi:  { fetchQuote: getDzengiQuote },
};

// ── Единая CEX-джоба ────────────────────────────────────────

export async function getCexQuotes(
  params: IJobParams_get_Cex_Quotes,
): Promise<CexQuotesResult> {
  const { source, token0, token1 } = params;

  const config = cexConfigs[source];
  if (!config) throw new Error(`Unknown CEX source: ${source}`);

  try {
    const quote = await config.fetchQuote(token0, token1);

    const result: CexQuotesResult = { ok: true, latencyMs: quote.latencyMs, quote };
    result.unified = cexToUnified(source, result, token0, token1);
    marketDataClient.writeQuote(result.unified);

    return result;
  } catch (err: any) {
    const result: CexQuotesResult = {
      ok: false,
      latencyMs: 0,
      error: err.message ?? String(err),
      quote: null,
    };
    result.unified = cexToUnified(source, result, token0, token1);
    printCexQuotesTable(source, result);

    return result;
  }
}

