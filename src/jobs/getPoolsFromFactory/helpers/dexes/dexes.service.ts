import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Dexes } from '../entities/entities';

@Injectable()
export class DexesService {
  constructor(
    @InjectRepository(Dexes)
    private dexesRepository: Repository<Dexes>,
  ) {}

  async findOne(id: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Dexes) : this.dexesRepository;

    const dex = await repo.findOne({
      where: { dexId: id },
    });

    if (!dex) throw new Error(`Dex with id ${id} not found`);

    return dex;
  }
}
