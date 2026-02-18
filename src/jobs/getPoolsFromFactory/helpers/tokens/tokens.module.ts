import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { Tokens } from '../entities/entities';
import { Chains } from '../entities/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Tokens, Chains])],
  controllers: [],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
