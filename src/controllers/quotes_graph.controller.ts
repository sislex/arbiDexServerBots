import { Controller, Get, Query } from '@nestjs/common';
import { runWithContext } from 'src/jobs/getPoolsFromFactory/utils/run-with-context';
import { initServices } from 'src/jobs/getPoolsFromFactory/utils/init-services';
import { DB_CONFIGS } from '../configs/db-configs';
import { DataSourceOptions } from 'typeorm';

export interface ExtraSettings {
  configData: any;
  configDB: DataSourceOptions;
}

@Controller('quotes_graph')
export class QuotesGraphController {
  @Get('cost')
  async getQuotes(
    @Query('project') projectKey: string,
    @Query('start') start?: string,
    @Query('finish') finish?: string,
  ) {
    const config = DB_CONFIGS[projectKey] as ExtraSettings | undefined;

    return await runWithContext(config, initServices, async ({ services }) => {
      return await services.quotesGraph.getAll(
        undefined,
        start ? Number(start) : undefined,
        finish ? Number(finish) : undefined,
      );
    });
  }
}
