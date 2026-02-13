import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chains } from '../entities/entities/Chains';

@Injectable()
export class ChainsService {
  constructor(
    @InjectRepository(Chains)
    private chainsRepository: Repository<Chains>,
  ) {}

  async findOne(id: number) {
    const chain = await this.chainsRepository.findOne({
      where: { chainId: id },
    });

    if (!chain) {
      throw new Error(`Chain with id ${id} not found`);
    }

    return chain;
  }
}
