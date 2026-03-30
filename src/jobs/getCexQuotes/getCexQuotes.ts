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

// ── Маппинг source → { fetchQuote, defaultSymbol } ────────

interface CexConfig {
  fetchQuote: (symbol: string) => Promise<CexQuote>;
  defaultSymbol: string;
}

const cexConfigs: Record<CexSourceName, CexConfig> = {
  binance: { fetchQuote: getBinanceQuote, defaultSymbol: 'ETHUSDC' },
  mexc:    { fetchQuote: getMexcQuote,    defaultSymbol: 'ETHUSDT' },
  bybit:   { fetchQuote: getBybitQuote,   defaultSymbol: 'ETHUSDT' },
  okx:     { fetchQuote: getOkxQuote,     defaultSymbol: 'ETH-USDT' },
  kucoin:  { fetchQuote: getKucoinQuote,  defaultSymbol: 'ETH-USDT' },
  gateio:  { fetchQuote: getGateioQuote,  defaultSymbol: 'ETH_USDT' },
};

// ── Единая CEX-джоба ────────────────────────────────────────

export async function getCexQuotes(
  params: IJobParams_get_Cex_Quotes,
): Promise<CexQuotesResult> {
  const { source } = params;

  const config = cexConfigs[source];
  if (!config) throw new Error(`Unknown CEX source: ${source}`);

  const symbol = params.symbol ?? config.defaultSymbol;

  try {
    const quote = await config.fetchQuote(symbol);

    const result: CexQuotesResult = { ok: true, latencyMs: quote.latencyMs, quote };
    result.unified = cexToUnified(source, result, symbol);
    marketDataClient.writeQuote(result.unified);

    return result;
  } catch (err: any) {
    const result: CexQuotesResult = {
      ok: false,
      latencyMs: 0,
      error: err.message ?? String(err),
      quote: null,
    };
    result.unified = cexToUnified(source, result, symbol);
    printCexQuotesTable(source, result);

    return result;
  }
}

