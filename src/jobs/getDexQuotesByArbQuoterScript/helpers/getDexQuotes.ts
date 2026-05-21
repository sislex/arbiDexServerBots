import { IPool } from '../../../store/state.types';
import { calculateScriptQuotes } from './calculate';
import { fetchBuySellQuotesByScript } from './fetchQuotes';
import { DexQuotesByArbQuoterScriptResult, ITokenPair } from './types';

export async function getDexQuotesByScript(params: {
  pairsToQuote: IPool[];
  rpcUrl: string;
  tokenPair: ITokenPair;
  humanReadable: boolean;
  quoterAddress: string;
  envPrefix: 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST';
}): Promise<DexQuotesByArbQuoterScriptResult> {
  const { pairsToQuote, rpcUrl, tokenPair, humanReadable, quoterAddress, envPrefix } = params;
  const totalStart = performance.now();

  try {
    const fetchResult = await fetchBuySellQuotesByScript(
      pairsToQuote,
      rpcUrl,
      tokenPair,
      quoterAddress,
      envPrefix,
    );

    const latencyMs = Math.round(performance.now() - totalStart);
    return calculateScriptQuotes({
      pairsToQuote,
      fetchResult,
      tokenPair,
      humanReadable,
      latencyMs,
    });
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - totalStart);
    return {
      ok: false,
      latencyMs,
      blockNumber: 0,
      error: err?.message ?? String(err),
      filteredPairsCount: pairsToQuote.length,
      bestBuyPrice: 0,
      bestSellPrice: 0,
      bestBuy: null,
      bestSell: null,
      allQuotes: [],
    };
  }
}

