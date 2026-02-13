import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dexes } from '../entities/entities/Dexes';

@Injectable()
export class DexesService {
  constructor(
    @InjectRepository(Dexes)
    private dexesRepository: Repository<Dexes>,
  ) {}
  async findOne(id: number) {
    const dex = await this.dexesRepository.findOne({
      where: { dexId: id },
    });
    if (!dex) throw new Error(`Dex with id ${id} not found`);

    return dex;
  }
}
