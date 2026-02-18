import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Chains } from '../entities/entities';

@Injectable()
export class ChainsService {
  constructor(
    @InjectRepository(Chains)
    private chainsRepository: Repository<Chains>,
  ) {}

  async findOne(id: number, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Chains)
      : this.chainsRepository;

    const chain = await repo.findOne({
      where: { chainId: id },
    });

    if (!chain) {
      throw new Error(`Chain with id ${id} not found`);
    }

    return chain;
  }
}
