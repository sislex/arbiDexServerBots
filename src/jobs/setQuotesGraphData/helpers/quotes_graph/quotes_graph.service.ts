import { Injectable } from '@nestjs/common';
import {
  Between,
  EntityManager,
  FindOptionsOrder,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
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

  async getAll(manager?: EntityManager, start?: number, finish?: number) {
    const repo = manager
      ? manager.getRepository(QuotesGraph)
      : this.quotesRepository;

    const where: FindOptionsWhere<QuotesGraph> = {};

    if (start && finish) {
      where.timestamp = Between(
        new Date(start * 1000),
        new Date(finish * 1000),
      );
    } else if (start) {
      where.timestamp = MoreThanOrEqual(new Date(start * 1000));
    } else if (finish) {
      where.timestamp = LessThanOrEqual(new Date(finish * 1000));
    }

    const order: FindOptionsOrder<QuotesGraph> = {
      timestamp: 'ASC',
    };

    return await repo.find({
      where,
      order,
    });
  }
}
