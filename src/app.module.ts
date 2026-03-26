import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StoreModule } from './store/store.module';
import { ErrorsController } from './controllers/ui-errors.controller';
import { StoreController } from './controllers/store.controller';
import { BotRunnerService } from './bots/bot-runner.service';
import { BotsController } from './controllers/bots.controller';
import { PriceWatcherService } from './bots/price-watcher.service';
import { PriceGateway } from './controllers/price.gateway';

@Module({
  imports: [StoreModule],
  controllers: [
    AppController,
    StoreController,
    BotsController,
    ErrorsController,
  ],
  providers: [BotRunnerService, PriceWatcherService, PriceGateway],
})
export class AppModule {}
