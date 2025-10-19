// src/store/ui-config.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppStore } from './app.store';
import type { IBotType } from './state.types';
import { selectBotsTypes } from './selectors';

@Controller('bots-types')
export class ConfigController {
  constructor(private readonly store: AppStore) {}

  @Get()
  getAll() { return this.store.snapshot(); }

  @Post('set-all')
  setAll(@Body() list: IBotType[]) {
    this.store.dispatch({ type: 'BOTS_TYPES/SET_ALL', payload: list });
    return this.store.select$(selectBotsTypes);
  }

  @Post()
  addOrUpsert(@Body() item: IBotType) {
    this.store.dispatch({ type: 'BOTS_TYPES/UPSERT_ONE', payload: item });
    return this.store.snapshot().botsTypesList;
  }

  @Delete(':type')
  remove(@Param('type') type: string) {
    this.store.dispatch({ type: 'BOTS_TYPES/REMOVE_ONE', payload: { type } });
    return { ok: true };
  }
}
