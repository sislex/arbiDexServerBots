import {IArbitrage, IGroupedQuotes} from '../store/state.types';
import {V2_DEXES} from '../helpers/dex.constants';
// import {arbitrageToTwoStepsConfigs} from './helpers/arbitrageToTwoStepsConfigs';
import {getMaxSpread} from '../helpers/getMaxSpreadArbitrage';
import {arbExecutor} from './helpers/arbExecutor';
import {arbitrageToTwoStepsConfigs} from './helpers/arbitrageToTwoStepsConfigs';

export async function doTwoSwap(arb: IArbitrage) {
  console.log("doTwoSwap: doTwoSwap", arb);

  if (!arb?.groups?.length) throw new Error("Arbitrage has no groups");

  const maxSpreadArbitrage: IGroupedQuotes | undefined = getMaxSpread(arb.groups);

  if (maxSpreadArbitrage) {
    const configForSwap = arbitrageToTwoStepsConfigs(maxSpreadArbitrage, {
      v2Dexes: V2_DEXES,
      slippageBps: 30,
      minProfitTokenIn: 1n,
      deadline: 0,
    });
    console.log("configForSwap: ", configForSwap);

    const arbExecutorResult = await arbExecutor(
      configForSwap,
      maxSpreadArbitrage.bestArbitrage.bestBuy?.pair.tokenIn.address!,
    );

    const quotesLogs = [
      {
        poolAddress: maxSpreadArbitrage.bestArbitrage.bestBuy?.pair.poolAddress,
        tokenIn: maxSpreadArbitrage.bestArbitrage.bestBuy?.pair.tokenIn.address!,
        tokenOut: maxSpreadArbitrage.bestArbitrage.bestBuy?.pair.tokenOut.address!,
        amountIn: maxSpreadArbitrage.bestArbitrage.bestBuy?.pair.amount,
        amountOut: maxSpreadArbitrage.bestArbitrage.bestBuy?.quote?.quoteExactInputSingle.amountOut,
      },
      {
        poolAddress: maxSpreadArbitrage.bestArbitrage.bestSell?.pair.poolAddress,
        tokenIn: maxSpreadArbitrage.bestArbitrage.bestSell?.pair.tokenIn.address!,
        tokenOut: maxSpreadArbitrage.bestArbitrage.bestSell?.pair.tokenOut.address!,
        amountIn: maxSpreadArbitrage.bestArbitrage.bestBuy?.quote?.quoteExactInputSingle.amountOut,
        amountOut: maxSpreadArbitrage.amountOutStep1,
      },
    ];

    const result = {
      blockQueue: arb.blockNumber,
      quoteSpreadPct: maxSpreadArbitrage.spread_pct,
      quotesLogs,
      ...arbExecutorResult,
    };
    console.log('result', result);

    return result;

  }
}
