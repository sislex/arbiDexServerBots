// src/store/store.module.ts
import { Module } from '@nestjs/common';
import { AppStore } from './app.store';

@Module({
  providers: [AppStore],
  exports: [AppStore],
})
export class StoreModule {}
