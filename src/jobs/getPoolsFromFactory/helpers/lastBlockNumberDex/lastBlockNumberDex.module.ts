import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LastBlockNumberDexService } from './lastBlockNumberDex.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [LastBlockNumberDexService],
  exports: [LastBlockNumberDexService],
})
export class LastBlockNumberDexModule {}
