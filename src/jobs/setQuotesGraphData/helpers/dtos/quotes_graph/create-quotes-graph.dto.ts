export class QuotesGraphDto {
  chainId: number;
  timestamp: Date;
  costBuy: string | bigint;
  costSell: string | bigint;
  token0: number;
  token1: number;
}
