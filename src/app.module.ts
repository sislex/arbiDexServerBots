import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StoreModule } from './store/store.module';
import { ErrorsController } from './controllers/ui-errors.controller';
import { StoreController } from './controllers/store.controller';
import { BotRunnerService } from './bots/bot-runner.service';
import { BotsController } from './controllers/bots.controller';
import { QuotesGraphController } from './controllers/quotes_graph.controller';
import { ChatGateway } from './helpers/websocket-gateway';

@Module({
  imports: [StoreModule],
  controllers: [
    AppController,
    StoreController,
    BotsController,
    ErrorsController,
    QuotesGraphController,
  ],
  providers: [BotRunnerService, ChatGateway],
})
export class AppModule {}
