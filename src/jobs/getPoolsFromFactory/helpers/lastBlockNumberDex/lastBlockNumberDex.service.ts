import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LastBlockNumberDex } from '../entities/entities';
import { LastBlockNumberDexDto } from '../dtos/last-block-number-dex-dto/last-block-number-dex.dto';

@Injectable()
export class LastBlockNumberDexService {
  constructor(
    @InjectRepository(LastBlockNumberDex)
    private lastBlockNumberDexRepository: Repository<LastBlockNumberDex>,
  ) {}
  async create(lastBlockNumberDex: LastBlockNumberDexDto, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(LastBlockNumberDex)
      : this.lastBlockNumberDexRepository;

    const lastBlockNumber = repo.create({
      blockNumber: lastBlockNumberDex.blockNumber ?? null,
      dex: lastBlockNumberDex.dex,
      version: lastBlockNumberDex.version,
    });

    return await repo.save(lastBlockNumber);
  }

  async findOneByVersionAndDex(version: string, dex: number, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(LastBlockNumberDex)
      : this.lastBlockNumberDexRepository;

    return await repo.findOne({
      where: {
        version: version,
        dex: dex,
      },
    });
  }

  async update(
    id: number,
    updateDto: Partial<LastBlockNumberDexDto>,
    manager?: EntityManager
  ) {
    const repo = manager
      ? manager.getRepository(LastBlockNumberDex)
      : this.lastBlockNumberDexRepository;

    await repo.update(id, {
      blockNumber: updateDto.blockNumber ?? null,
      dex: updateDto.dex,
      version: updateDto.version,
    });

    return await repo.findOne({ where: { id } });
  }

  async upsert(dto: LastBlockNumberDexDto, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(LastBlockNumberDex)
      : this.lastBlockNumberDexRepository;

    // 1. Пытаемся найти существующую запись
    const existing = await repo.findOne({
      where: {
        version: dto.version,
        dex: dto.dex,
      },
    });

    if (existing) {
      // 2. Если есть — обновляем по ID
      await repo.update(existing.id, {
        blockNumber: dto.blockNumber ?? null,
        // dex и version обычно не меняются, но можно оставить для консистентности
      });
      return await repo.findOne({ where: { id: existing.id } });
    } else {
      // 3. Если нет — создаем новую
      const newItem = repo.create({
        blockNumber: dto.blockNumber ?? null,
        dex: dto.dex,
        version: dto.version,
      });
      return await repo.save(newItem);
    }
  }

}
