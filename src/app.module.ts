import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import {StoreModule} from './store/store.module';
import {ErrorsController} from './controllers/ui-errors.controller';
import {StoreController} from './controllers/store.controller';
import {BotsTypesController} from './controllers/bots-types-list.controller';
import {BotRunnerService} from './bots/bot-runner.service';

@Module({
  imports: [StoreModule],
  controllers: [AppController, StoreController, BotsTypesController, ErrorsController],
  providers: [BotRunnerService],
})
export class AppModule {}
