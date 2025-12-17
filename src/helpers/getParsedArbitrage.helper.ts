import {IArbitrage} from './createArbitrage';
import {IPairToQuote, ITokenInfo} from '../store/state.types';

export interface IParsedArbitrage {
  createdAt: string;      // UTC ISO string
  blockNumber: number;
  poolsCount: number;
  amountIn: string;
  spread_pct: number;
  tokenIn: ITokenInfo;
  tokenOut: ITokenInfo;
  bestBuyPool: IPairToQuote;
  bestSellPool: IPairToQuote;
}

export const getParsedArbitrage = (arbitrageList: IArbitrage[]): IParsedArbitrage[] | any => {
  const parsedArbitrage: IParsedArbitrage[]= [];
  arbitrageList.forEach((arbitrage: IArbitrage) => {
    const createdAt = arbitrage.createdAt;
    const blockNumber = arbitrage.blockNumber;
    arbitrage.groups.forEach(group => {
      parsedArbitrage.push({
        createdAt,
        blockNumber,
        poolsCount: group.poolsCount,
        amountIn: group.amountIn,
        spread_pct: group.spread_pct,
        tokenIn: group.tokenIn,
        tokenOut: group.tokenOut,
        bestBuyPool: group.bestBuyPool,
        bestSellPool: group.bestSellPool,
      } );
    })
  });

  return parsedArbitrage;
};
