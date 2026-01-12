import {IArbitrage, IGroupedQuotes} from '../store/state.types';
import {V2_DEXES} from '../helpers/dex.constants';
// import {arbitrageToTwoStepsConfigs} from './helpers/arbitrageToTwoStepsConfigs';
import {getMaxSpread} from '../helpers/getMaxSpreadArbitrage';
import {arbExecutor} from './helpers/arbExecutor';

export async function doTwoSwap(arb: IArbitrage) {
  // console.log("doTwoSwap: doTwoSwap", arb);
  //
  // if (!arb?.groups?.length) throw new Error("Arbitrage has no groups");
  //
  // // Берём только валидные группы
  // const groups = arb.groups.filter(
  //   (g) =>
  //     g.bestBuyPool &&
  //     g.bestSellPool &&
  //     g.amountOut !== undefined &&
  //     g.amountInBuy !== undefined
  // );
  //
  // if (!groups.length) throw new Error("No suitable groups found (need bestBuyPool, bestSellPool, amountOut, amountInBuy)");
  //
  // const maxSpreadArbitrage: IGroupedQuotes | undefined = getMaxSpread(arb.groups);
  //
  // // console.log("maxSpreadArbitrage: ", maxSpreadArbitrage);
  //
  // if (maxSpreadArbitrage) {
  //   const configForSwap = arbitrageToTwoStepsConfigs(maxSpreadArbitrage, {
  //     v2Dexes: V2_DEXES,
  //     slippageBps: 30,
  //     minProfitTokenIn: 1n,
  //     deadline: 0,
  //   });
  //   // console.log("configForSwap: ", configForSwap);
  //
  //   const arbExecutorResult = await arbExecutor(
  //     configForSwap,
  //     maxSpreadArbitrage.tokenIn.address,
  //   );
  //
  //   // console.log('maxSpreadArbitrage', maxSpreadArbitrage);
  //
  //   const quotesLogs = [
  //     {
  //       poolAddress: maxSpreadArbitrage.bestSellPool?.poolAddress,
  //       tokenIn: maxSpreadArbitrage.bestSellPool?.tokenIn.address,
  //       tokenOut: maxSpreadArbitrage.bestSellPool?.tokenOut.address,
  //       amountIn: maxSpreadArbitrage.amountIn,
  //       amountOut: maxSpreadArbitrage.bestSellQuote?.amountOut,
  //     },
  //     {
  //       poolAddress: maxSpreadArbitrage.bestBuyPool?.poolAddress,
  //       tokenIn: maxSpreadArbitrage.bestBuyPool?.tokenIn.address,
  //       tokenOut: maxSpreadArbitrage.bestBuyPool?.tokenOut.address,
  //       amountIn: maxSpreadArbitrage.bestSellQuote?.amountOut,
  //       amountOut: 0,
  //     },
  //   ];
  //
  //   const result = {
  //     blockQueue: arb.blockNumber,
  //     quoteSpreadPct: maxSpreadArbitrage.spread_pct,
  //     quotesLogs,
  //     ...arbExecutorResult,
  //   };
  //   // console.log('result', result);
  //
  //   return result;
  //
  //
  // }
}
