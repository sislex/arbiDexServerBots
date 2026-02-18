import { Module } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from '../entities/entities';
import { Dexes } from '../entities/entities';
import { Chains } from '../entities/entities';
import { Tokens } from '../entities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Pools, Dexes, Tokens, Chains])],
  controllers: [],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
