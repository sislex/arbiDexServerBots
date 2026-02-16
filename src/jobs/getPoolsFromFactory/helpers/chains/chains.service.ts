import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm'; // Добавили EntityManager
import { Chains } from '../entities/entities/Chains';

@Injectable()
export class ChainsService {
  constructor(
    @InjectRepository(Chains)
    private chainsRepository: Repository<Chains>,
  ) {}

  // Добавляем опциональный manager
  async findOne(id: number, manager?: EntityManager) {
    // Выбираем репозиторий в зависимости от наличия динамического менеджера
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
