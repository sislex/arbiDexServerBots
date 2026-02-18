import { Module } from '@nestjs/common';
import { DexesService } from './dexes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from '../entities/entities';
import { Dexes } from '../entities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Dexes, Pools])],
  controllers: [],
  providers: [DexesService],
  exports: [DexesService],
})
export class DexesModule {}
