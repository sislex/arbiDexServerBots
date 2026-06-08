import type { UnifiedQuoteResult } from './types';

const V2_ROUTERS_BY_SOURCE: Record<string, Record<string, string>> = {
  'dex:arbitrum': {
    uniswap: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    sushi: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    camelot: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
  },
};

const NETWORK_PREFIX_BY_SOURCE: Record<string, string> = {
  'dex:arbitrum': 'ARBITRUM',
  'dex:optimism': 'OPTIMISM',
  'dex:base': 'BASE',
  'dex:blast': 'BLAST',
  'dex:linea': 'LINEA',
};

export type PoolValue = {
  dex: string;
  version: string;
  poolAddress: string;
};

export interface QuoteWritePoint {
  key: string;
  value: number | PoolValue;
  timestamp?: number;
}

export function quoteToWritePoints(
  quote: UnifiedQuoteResult,
): QuoteWritePoint[] {
  if (!quote.ok) return [];

  const baseKey = `${quote.source}|${quote.token0}/${quote.token1}`;
  const points: QuoteWritePoint[] = [
    {
      key: `${baseKey}|bidPrice`,
      value: quote.bidPrice,
      timestamp: quote.timestamp,
    },
    {
      key: `${baseKey}|askPrice`,
      value: quote.askPrice,
      timestamp: quote.timestamp,
    },
  ];

  if (quote.sourceType === 'dex') {
    if (quote.bestSellPool?.poolAddress) {
      points.push({
        key: `${baseKey}|bidPool`,
        value: poolToStoreValue(quote.source, quote.bestSellPool),
        timestamp: quote.timestamp,
      });
    }

    if (quote.bestBuyPool?.poolAddress) {
      points.push({
        key: `${baseKey}|askPool`,
        value: poolToStoreValue(quote.source, quote.bestBuyPool),
        timestamp: quote.timestamp,
      });
    }
  }

  return points;
}

function poolToStoreValue(
  source: UnifiedQuoteResult['source'],
  pool: NonNullable<UnifiedQuoteResult['bestBuyPool']>,
): PoolValue {
  const isV2 = pool.version === 'v2';
  const v2Router = resolveV2Router(source, pool.dex);

  return {
    dex: pool.dex,
    version: pool.version,
    poolAddress: isV2 ? (v2Router ?? pool.poolAddress) : pool.poolAddress,
  };
}

function resolveV2Router(
  source: UnifiedQuoteResult['source'],
  dex: string,
): string | undefined {
  const normalizedDex = dex.toLowerCase();
  const baseKey = v2RouterEnvBaseKey(normalizedDex);
  const networkPrefix = NETWORK_PREFIX_BY_SOURCE[source];

  if (baseKey && networkPrefix) {
    const prefixedEnvRouter = process.env[`${networkPrefix}_${baseKey}`];
    if (prefixedEnvRouter) return prefixedEnvRouter;
  }

  if (baseKey) {
    const genericEnvRouter = process.env[baseKey];
    if (genericEnvRouter) return genericEnvRouter;
  }

  return V2_ROUTERS_BY_SOURCE[source]?.[normalizedDex];
}

function v2RouterEnvBaseKey(dex: string): string | undefined {
  if (dex === 'uniswap') return 'UNISWAP_V2_ROUTER';
  if (dex === 'sushi') return 'SUSHISWAP_V2_ROUTER';
  if (dex === 'camelot') return 'CAMELOT_V2_ROUTER';
  if (dex === 'pancake') return 'PANCAKESWAP_V2_ROUTER';
  return undefined;
}
