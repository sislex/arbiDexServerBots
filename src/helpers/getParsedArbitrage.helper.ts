import {IArbitrage, IPairToQuote, IParsedArbitrage, ITokenInfo} from '../store/state.types';

export const getParsedArbitrage = (
  arbitrageList: IArbitrage[]
): IParsedArbitrage[] => {
  const parsed: IParsedArbitrage[] = [];

  for (const arbitrage of arbitrageList) {
    const { createdAt, blockNumber } = arbitrage;

    for (const group of arbitrage.groups) {
      parsed.push({
        createdAt,
        blockNumber,

        tokenIn: group.bestArbitrage.bestBuy?.pair.tokenIn,
        tokenOut: group.bestArbitrage.bestBuy?.pair.tokenOut,

        amountIn: group.bestArbitrage.bestBuy?.pair.amount,

        spread_pct: group.spread_pct,

        bestBuyPool: group.bestArbitrage.bestBuy?.pair ?? null,
        bestSellPool: group.bestArbitrage.bestSell?.pair ?? null,
      });
    }
  }

  return parsed;
};
