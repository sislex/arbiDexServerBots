import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm'; // Добавили EntityManager
import { Dexes } from '../entities/entities/Dexes';

@Injectable()
export class DexesService {
  constructor(
    @InjectRepository(Dexes)
    private dexesRepository: Repository<Dexes>,
  ) {}

  // Добавляем опциональный manager для поддержки динамических подключений
  async findOne(id: number, manager?: EntityManager) {
    // Если manager передан, берем репозиторий из него, иначе — стандартный
    const repo = manager ? manager.getRepository(Dexes) : this.dexesRepository;

    const dex = await repo.findOne({
      where: { dexId: id },
    });

    if (!dex) throw new Error(`Dex with id ${id} not found`);

    return dex;
  }
}
