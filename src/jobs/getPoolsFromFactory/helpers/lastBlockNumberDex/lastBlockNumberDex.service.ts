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

  async findOneByVersionAndDex(
    version: string,
    dex: number,
    chainId: number,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(LastBlockNumberDex)
      : this.lastBlockNumberDexRepository;

    return await repo.findOne({
      where: {
        version: version,
        dex: dex,
        chainId: chainId,
      },
    });
  }

  async upsert(dto: LastBlockNumberDexDto, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(LastBlockNumberDex)
      : this.lastBlockNumberDexRepository;

    // Обязательная проверка перед БД, чтобы поймать ошибку в коде
    if (!dto.chainId) {
      throw new Error('chainId is required for LastBlockNumberDex upsert');
    }

    // Postgres сделает: INSERT ... ON CONFLICT (dex, version, chain_id) DO UPDATE
    await repo.upsert(
      {
        dex: dto.dex,
        version: dto.version,
        chainId: dto.chainId,
        blockNumber: dto.blockNumber ?? null,
      },
      ['dex', 'version', 'chainId'],
    );

    return this.findOneByVersionAndDex(
      dto.version,
      dto.dex,
      dto.chainId,
      manager,
    );
  }
}
