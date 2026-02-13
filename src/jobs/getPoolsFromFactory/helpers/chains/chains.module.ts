import { Module } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tokens } from '../entities/entities/Tokens';
import { Chains } from '../entities/entities/Chains';
import { RpcUrls } from '../entities/entities/RpcUrls';

@Module({
  imports: [TypeOrmModule.forFeature([Tokens, Chains, RpcUrls])],
  controllers: [],
  providers: [ChainsService],
  exports: [ChainsService],
})
export class ChainsModule {}
