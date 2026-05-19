import { IPool } from '../../../store/state.types';
import { ITokenPair, DexQuotesByArbQuoteResult } from './types';
import { validateQuoterParams } from './validateQuoterParams';
import { fetchBuySellQuotes } from './fetchBuySellQuotes';
import { calculateQuotes } from './calculateQuotes';

export interface GetDexQuotesParams {
  pairsToQuote: IPool[];
  rpcUrl: string;
  tokenPair: ITokenPair;
  humanReadable: boolean;
  quoterAddress?: string;
}

/**
 * Получает котировки buy/sell из DEX пулов и рассчитывает цены.
 *
 * 1. Валидация параметров
 * 2. Fetch сырых котировок (quoteExactInBatch × 2)
 * 3. Расчёт цен, bestBuy/bestSell
 * 4. Замер latencyMs
 */
export async function getDexQuotes(params: GetDexQuotesParams): Promise<DexQuotesByArbQuoteResult> {
  const { pairsToQuote, rpcUrl, tokenPair, humanReadable } = params;
  const totalStart = performance.now();

  // ── Валидация ──
  const validation = validateQuoterParams(pairsToQuote, params.quoterAddress);

  if (!validation.ok) {
    return {
      ok: false,
      latencyMs: 0,
      blockNumber: 0,
      error: validation.error,
      filteredPairsCount: 0,
      bestBuyPrice: 0,
      bestSellPrice: 0,
      bestBuy: null,
      bestSell: null,
      allQuotes: [],
    };
  }

  try {
    // ── Fetch ──
    const fetchResult = await fetchBuySellQuotes(pairsToQuote, rpcUrl, tokenPair, validation.quoterAddress);

    console.log('fetchResult', fetchResult);

    // ── Calculate ──
    const latencyMs = Math.round(performance.now() - totalStart);

    return calculateQuotes({
      pairsToQuote,
      fetchResult,
      tokenPair,
      humanReadable,
      latencyMs,
    });
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - totalStart);
    const rawMessage = err?.message ?? String(err);
    const error = rawMessage.includes('CALL_EXCEPTION')
      ? `${rawMessage}. Проверьте соответствие rpcUrl, quoterAddress и pairsToQuote (сеть/адреса пулов).`
      : rawMessage;

    return {
      ok: false,
      latencyMs,
      blockNumber: 0,
      error,
      filteredPairsCount: pairsToQuote.length,
      bestBuyPrice: 0,
      bestSellPrice: 0,
      bestBuy: null,
      bestSell: null,
      allQuotes: [],
    };
  }
}
