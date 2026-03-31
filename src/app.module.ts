import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StoreModule } from './store/store.module';
import { ErrorsController } from './controllers/ui-errors.controller';
import { StoreController } from './controllers/store.controller';
import { BotRunnerService } from './bots/bot-runner.service';
import { BotsController } from './controllers/bots.controller';
import { PricesProxyController } from './controllers/prices-proxy.controller';
import { PriceProxyGateway } from './controllers/price-proxy.gateway';

@Module({
  imports: [StoreModule],
  controllers: [
    AppController,
    StoreController,
    BotsController,
    ErrorsController,
    PricesProxyController,
  ],
  providers: [BotRunnerService, PriceProxyGateway],
})
export class AppModule {}
