import { IJobParams_get_Dex_Quotes_By_Arb_Quoter } from '../../store/state.types';
import { USDC, WETH } from '../../store/stabs/tokens.stabs';
import { toAmount } from './helpers/toAmount';
import { getDexQuotes } from './helpers/getDexQuotes';
import type {
  GetDexQuotesByArbQuoterOpts,
  DexQuotesByArbQuoteResult,
} from './helpers/types';
import { dexToUnified, marketDataClient } from '../shared';

// Реэкспорт
export type {
  IDexTokenConfig,
  ITokenPair,
  GetDexQuotesByArbQuoterOpts,
  PoolQuoteResult,
  DexQuotesByArbQuoteResult,
} from './helpers/types';
export { toAmount } from './helpers/toAmount';
export { getDexQuotes } from './helpers/getDexQuotes';

export const TOKEN_PAIR = {
  tokenIn: {
    address: USDC.address,
    amount: toAmount(20000, USDC.decimals),
    decimals: USDC.decimals,
    symbol: 'USDC',
  },
  tokenOut: {
    address: WETH.address,
    amount: toAmount(3, WETH.decimals),
    decimals: WETH.decimals,
    symbol: 'WETH',
  },
} as const;

// ── Джоба ────────────────────────────────────────────────────


function getUniversalHumanAmount(decimals: number, symbol: string): number {
  if (['USDC', 'USDT', 'DAI'].includes(symbol)) return 100;

  // 2. Логика по весу decimals
  if (decimals <= 8) return 0.001; // BTC и похожие (дорогие)
  if (decimals <= 12) return 10;   // Средние токены
  return 1;                        // Стандарт (ETH и альты 18 dec)
}

export async function getDexQuotesByArbQuoter(
  params: IJobParams_get_Dex_Quotes_By_Arb_Quoter,
  opts?: Partial<GetDexQuotesByArbQuoterOpts>,
): Promise<DexQuotesByArbQuoteResult> {
  const { pairsToQuote, rpcUrl = 'https://arb1.arbitrum.io/rpc' } = params;

  // 1. Вычисляем суммы на основе метаданных из params
  const humanAmount0 = getUniversalHumanAmount(params.decimals0 || 0, params.symbol0 || '');
  const humanAmount1 = getUniversalHumanAmount(params.decimals1 || 0, params.symbol1 || ''); // поправил на symbol1

  const tokenPair = opts?.tokenPair ?? {
    tokenIn: {
      address: params.token0 || '',
      amount: toAmount(humanAmount0, params.decimals0 || 0),
      decimals: params.decimals0 || 0, // Добавили || 0
      symbol: params.symbol0 || '',
    },
    tokenOut: {
      address: params.token1 || '',
      amount: toAmount(humanAmount1, params.decimals1 || 0),
      decimals: params.decimals1 || 0, // Добавили || 0
      symbol: params.symbol1 || '',
    },
  };


  console.log(':::: Running Quote with:', {
    pair: `${tokenPair.tokenIn.symbol} -> ${tokenPair.tokenOut.symbol}`,
    amountIn: tokenPair.tokenIn.amount
  });

  const result = await getDexQuotes({
    pairsToQuote,
    rpcUrl,
    tokenPair,
    humanReadable: opts?.humanReadable ?? true,
    quoterAddress: process.env.QUOTER_ADDRESS,
  });

  // Передаем параметры токенов в унификатор
  result.unified = dexToUnified(result, params.token0, params.token1);
  marketDataClient.writeQuote(result.unified);

  return result;
}

