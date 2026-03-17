import { Controller, Get } from '@nestjs/common';
import { QuotesGraphService } from '../jobs/setQuotesGraphData/helpers/quotes_graph/quotes_graph.service';
import { runWithContext } from 'src/jobs/getPoolsFromFactory/utils/run-with-context';
import { initServices } from 'src/jobs/getPoolsFromFactory/utils/init-services';

@Controller('quotes_graph')
export class QuotesGraphController {
  constructor(private quotesGraph: QuotesGraphService) {}

  @Get('cost')
  async getQuotes(@Headers('x-db-config') dbConfig: string) {
    // Используем твой готовый механизм runWithContext
    return await runWithContext(
      dbConfig,
      initServices,
      async ({ services }) => {
        // Вызываем метод получения данных из сервиса
        return await services.quotesGraph.getAll();
      },
    );
  }
}
