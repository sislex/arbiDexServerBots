import { IBestBuySellArbitrage } from '../arbitrage/best-buy-sell.arbitrage';

export interface IArbitrage extends IBestBuySellArbitrage {
  createdAt: string;   // UTC ISO
  blockNumber: number;
}

export function createArbitrage(
  params: Omit<IArbitrage, 'createdAt'>
): IArbitrage {
  return {
    createdAt: new Date().toISOString(),
    ...params,
  };
}
