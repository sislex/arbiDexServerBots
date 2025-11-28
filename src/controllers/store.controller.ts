// src/store/bots.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppStore } from '../store/app.store';
import type { IBotType } from '../store/state.types';
import { selectBotsTypes } from '../store/selectors';

@Controller('store')
export class StoreController {
  constructor(private readonly store: AppStore) {}

  @Get()
  getAll() { return this.store.snapshot(); }

}
