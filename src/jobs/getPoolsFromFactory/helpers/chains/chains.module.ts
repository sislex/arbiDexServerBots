import { Module } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tokens } from '../entities/entities';
import { Chains } from '../entities/entities';
import { RpcUrls } from '../entities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Tokens, Chains, RpcUrls])],
  controllers: [],
  providers: [ChainsService],
  exports: [ChainsService],
})
export class ChainsModule {}
