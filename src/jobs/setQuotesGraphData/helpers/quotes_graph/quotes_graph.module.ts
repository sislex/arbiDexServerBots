import { Module } from '@nestjs/common';
import { QuotesGraphService } from './quotes_graph.service';

@Module({
  controllers: [],
  providers: [QuotesGraphService],
})
export class QuotesGraphModule {}
