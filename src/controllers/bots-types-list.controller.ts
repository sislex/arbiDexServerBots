// src/store/bots-types-list.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppStore } from '../store/app.store';
import type { IBotType } from '../store/state.types';
import { selectBotsTypes } from '../store/selectors';
import {take} from 'rxjs';

@Controller('bots-types-list')
export class BotsTypesController {
  constructor(private readonly store: AppStore) {}


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
