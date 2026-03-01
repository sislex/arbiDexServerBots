import {IArbitrage, IPairToQuote, IParsedArbitrage, ITokenInfo} from '../store/state.types';

export const getParsedArbitrage = (
  arbitrageList: IArbitrage[]
): IParsedArbitrage[] => {
  const parsed: any[] = [];

  for (const arbitrage of arbitrageList) {
    const { createdAt, blockNumber } = arbitrage;

    for (const group of arbitrage.groups) {
      // console.log('group', group);
      parsed.push({
        createdAt,
        blockNumber: group.blockNumber,

        tokenIn: group.tokenIn,
        tokenOut: group.tokenOut,

        amountIn: String(group.amountIn),

        spread_pct: group.profitPct,

        bestBuyPool: group.pool0?? null,
        bestSellPool: group.pool1 ?? null,
        gas: String(group.gas) ?? null,
      });
    }
  }

  return parsed;
};
