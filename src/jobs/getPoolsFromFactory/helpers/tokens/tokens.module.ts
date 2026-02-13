import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { Tokens } from '../entities/entities/Tokens';
import { Chains } from '../entities/entities/Chains';

@Module({
  imports: [TypeOrmModule.forFeature([Tokens, Chains])],
  controllers: [],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
