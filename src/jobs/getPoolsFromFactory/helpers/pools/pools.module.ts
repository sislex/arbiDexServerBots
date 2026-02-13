import { Module } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from '../entities/entities/Pools';
import { Dexes } from '../entities/entities/Dexes';
import { Chains } from '../entities/entities/Chains';
import { Tokens } from '../entities/entities/Tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Pools, Dexes, Tokens, Chains])],
  controllers: [],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
