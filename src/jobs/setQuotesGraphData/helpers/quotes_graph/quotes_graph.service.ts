import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { QuotesGraph } from '../entities/entities/QuotesGraph';
import { QuotesGraphDto } from '../dtos/quotes_graph/create-quotes-graph.dto';

@Injectable()
export class QuotesGraphService {
  constructor(private readonly quotesRepository: Repository<QuotesGraph>) {}

  async create(dto: QuotesGraphDto, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(QuotesGraph)
      : this.quotesRepository;

    const quote = repo.create({
      timestamp: dto.timestamp,
      costBuy: dto.costBuy.toString(),
      costSell: dto.costSell.toString(),
      chainId: dto.chainId,
      token0Id: dto.token0,
      token1Id: dto.token1,
    });

    return await repo.save(quote);
  }
}
