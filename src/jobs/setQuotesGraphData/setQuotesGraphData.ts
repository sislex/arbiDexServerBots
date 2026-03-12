import { QuotesGraphService } from './helpers/quotes_graph/quotes_graph.service';
import { EntityManager } from 'typeorm';
import { QuotesGraph } from './helpers/entities/entities/QuotesGraph';

export interface IQuoteData {
  token0Addr: string;
  token1Addr: string;
  costBuy: string | bigint;
  costSell: string | bigint;
  timestamp: Date;
}

export async function setQuotesGraphData(
  quotes: IQuoteData[],
  tokenMap: Map<string, number>,
  config: { chainId: number },
  quotesGraphService: QuotesGraphService,
  manager: EntityManager,
) {
  const createdRecords: QuotesGraph[] = [];

  for (const quote of quotes) {
    const t0Addr = quote.token0Addr.toLowerCase();
    const t1Addr = quote.token1Addr.toLowerCase();

    const token0Id = tokenMap.get(t0Addr);
    const token1Id = tokenMap.get(t1Addr);

    if (!token0Id || !token1Id) {
      console.warn(
        `[QuotesGraph] Tokens not found for pair ${t0Addr}/${t1Addr}. Skipping...`,
      );
      continue;
    }

    try {
      const savedQuote = await quotesGraphService.create(
        {
          chainId: config.chainId,
          timestamp: quote.timestamp,
          costBuy: quote.costBuy,
          costSell: quote.costSell,
          token0: token0Id,
          token1: token1Id,
        },
        manager,
      );

      createdRecords.push(savedQuote);
    } catch (e: unknown) {
      // Безопасное извлечение сообщения об ошибке
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error(
        `[QuotesGraph] Failed to save quote for ${t0Addr}/${t1Addr}: ${errorMessage}`,
      );
    }
  }

  return createdRecords;
}
