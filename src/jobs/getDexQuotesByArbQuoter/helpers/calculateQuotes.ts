import { ethers } from 'ethers';
import { IPool } from '../../../store/state.types';
import { ITokenPair, PoolQuoteResult, DexQuotesByArbQuoteResult } from './types';
import { FetchBuySellQuotesResult } from './fetchBuySellQuotes';

export interface CalculateQuotesParams {
  pairsToQuote: IPool[];
  fetchResult: FetchBuySellQuotesResult;
  tokenPair: ITokenPair;
  humanReadable: boolean;
  latencyMs: number;
}

/**
 * Принимает сырые данные из fetchBuySellQuotes и рассчитывает:
 * - allQuotes с нормализованными ценами buyPrice / sellPrice
 * - bestBuy / bestSell
 */
export function calculateQuotes(params: CalculateQuotesParams): DexQuotesByArbQuoteResult {
  const { pairsToQuote, fetchResult, tokenPair, humanReadable, latencyMs } = params;
  const { buyQuotes, sellQuotes, blockNumber, gasUsed } = fetchResult;

  const buyAmountIn  = tokenPair.tokenIn.amount;
  const sellAmountIn = tokenPair.tokenOut.amount;

  const realInDec  = tokenPair.tokenIn.decimals;
  const realOutDec = tokenPair.tokenOut.decimals;

  // ── Формируем allQuotes (buy + sell для каждого пула) ──
  const allQuotes: PoolQuoteResult[] = pairsToQuote.map((pair, i) => {
    const buy  = buyQuotes[i];
    const sell = sellQuotes[i];

    // Цена всегда: «сколько tokenIn (USDC) стоит 1 tokenOut (WETH)»
    //
    // tokenOut (WETH) — ВСЕГДА в human units (чтобы получить «за 1 WETH»)
    // tokenIn  (USDC) — зависит от humanReadable:
    //   true  → human:  100   USDC / 0.04635 WETH = 2157    USDC за 1 WETH
    //   false → raw:    100000000  / 0.04635 WETH = 2157000000 (smallest units USDC)

    let buyPrice  = 0;
    let sellPrice = 0;

    const inDec = humanReadable ? realInDec : 0;

    if (buy.success && buy.amountOut > 0n) {
      const inNum  = Number(ethers.formatUnits(buyAmountIn, inDec));
      const outNum = Number(ethers.formatUnits(buy.amountOut, realOutDec));
      buyPrice = inNum / outNum;
    }

    if (sell.success && sell.amountOut > 0n) {
      const wethNum = Number(ethers.formatUnits(sellAmountIn, realOutDec));
      const usdcNum = Number(ethers.formatUnits(sell.amountOut, inDec));
      sellPrice = usdcNum / wethNum;
    }

    return {
      poolIndex: i,
      dex: pair.dex,
      version: pair.version,
      poolAddress: pair.poolAddress,
      feePpm: pair.feePpm,

      buyAmountOut: buy.amountOut.toString(),
      buyAmountOutFormatted: buy.success
        ? ethers.formatUnits(buy.amountOut, humanReadable ? realOutDec : 0)
        : '—',
      buySuccess: buy.success,

      sellAmountOut: sell.amountOut.toString(),
      sellAmountOutFormatted: sell.success
        ? ethers.formatUnits(sell.amountOut, humanReadable ? realInDec : 0)
        : '—',
      sellSuccess: sell.success,

      buyPrice,
      sellPrice,

      gasUsed: gasUsed.toString(),
    };
  });

  // ── Лучшая buy (макс amountOut) и лучшая sell (макс amountOut) ──
  let bestBuy:  PoolQuoteResult | null = null;
  let bestSell: PoolQuoteResult | null = null;
  let bestBuyAmt  = 0n;
  let bestSellAmt = 0n;

  for (const q of allQuotes) {
    const buyAmt  = BigInt(q.buyAmountOut);
    const sellAmt = BigInt(q.sellAmountOut);

    if (q.buySuccess && buyAmt > bestBuyAmt) {
      bestBuyAmt = buyAmt;
      bestBuy = q;
    }
    if (q.sellSuccess && sellAmt > bestSellAmt) {
      bestSellAmt = sellAmt;
      bestSell = q;
    }
  }

  return {
    ok: true,
    latencyMs,
    blockNumber: Number(blockNumber),
    filteredPairsCount: pairsToQuote.length,
    bestBuyPrice: bestBuy?.buyPrice ?? 0,
    bestSellPrice: bestSell?.sellPrice ?? 0,
    bestBuy,
    bestSell,
    allQuotes,
  };
}

