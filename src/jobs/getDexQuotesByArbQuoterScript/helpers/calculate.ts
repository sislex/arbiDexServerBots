import { ethers } from 'ethers';
import type { IPool } from '../../../store/state.types';
import type { FetchBuySellQuotesResult } from './fetchQuotes';
import type { DexQuotesByArbQuoterScriptResult, ITokenPair, PoolQuoteResult } from './types';

export function calculateScriptQuotes(params: {
  pairsToQuote: IPool[];
  fetchResult: FetchBuySellQuotesResult;
  tokenPair: ITokenPair;
  humanReadable: boolean;
  latencyMs: number;
}): DexQuotesByArbQuoterScriptResult {
  const { pairsToQuote, fetchResult, tokenPair, humanReadable, latencyMs } = params;
  const { buyQuotes, sellQuotes, blockNumber, gasUsed } = fetchResult;

  const buyAmountIn = tokenPair.tokenIn.amount ?? 0n;
  const sellAmountIn = tokenPair.tokenOut.amount ?? 0n;
  const realInDec = tokenPair.tokenIn.decimals;
  const realOutDec = tokenPair.tokenOut.decimals;

  const allQuotes: PoolQuoteResult[] = pairsToQuote.map((pair, i) => {
    const buy = buyQuotes[i];
    const sell = sellQuotes[i];

    let buyPrice = 0;
    let sellPrice = 0;

    const inDec = humanReadable ? realInDec : 0;

    if (buy.success && buy.amountOut > 0n) {
      const inNum = Number(ethers.formatUnits(buyAmountIn, inDec));
      const outNum = Number(ethers.formatUnits(buy.amountOut, realOutDec));
      buyPrice = inNum / outNum;
    }

    if (sell.success && sell.amountOut > 0n) {
      const sellInAmount = sell.amountIn ?? sellAmountIn;
      const outNum = Number(ethers.formatUnits(sellInAmount, realOutDec));
      const inNum = Number(ethers.formatUnits(sell.amountOut, inDec));
      sellPrice = inNum / outNum;
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

  let bestBuy: PoolQuoteResult | null = null;
  let bestSell: PoolQuoteResult | null = null;
  let bestBuyAmt = 0n;
  let bestSellAmt = 0n;

  for (const q of allQuotes) {
    const buyAmt = BigInt(q.buyAmountOut);
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

