import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {StoreModule} from './store/store.module';
import {ConfigController} from './store/ui-config.controller';
import {ErrorsController} from './store/ui-errors.controller';

@Module({
  imports: [StoreModule],
  controllers: [AppController, ConfigController, ErrorsController],
  providers: [],
})
export class AppModule {}
