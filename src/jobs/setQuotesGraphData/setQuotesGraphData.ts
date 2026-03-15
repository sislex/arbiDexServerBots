import { QuotesGraphService } from './helpers/quotes_graph/quotes_graph.service';
import { EntityManager } from 'typeorm';
import { QuotesGraph } from './helpers/entities/entities/QuotesGraph';

export interface IQuoteData {
  token0Id: number;
  token1Id: number;
  costBuy: string | bigint;
  costSell: string | bigint;
  timestamp: Date;
}

export async function setQuotesData(
  quotes: IQuoteData[],
  quotesGraphService: QuotesGraphService,
  manager: EntityManager,
) {
  const createdRecords: QuotesGraph[] = [];

  for (const quote of quotes) {
    try {
      const savedQuote = await quotesGraphService.create(
        {
          chainId: 1,
          timestamp: quote.timestamp,
          costBuy: quote.costBuy,
          costSell: quote.costSell,
          token0: quote.token0Id,
          token1: quote.token1Id,
        },
        manager,
      );

      createdRecords.push(savedQuote);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error(
        `[QuotesGraph] Failed to save quote for ${quote.token0Id}/${quote.token1Id}: ${errorMessage}`,
      );
    }
  }

  return createdRecords;
}
