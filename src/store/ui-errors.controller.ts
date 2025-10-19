// src/store/ui-errors.controller.ts
import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { AppStore } from './app.store';
import type { IErrorItem } from './state.types';

@Controller('errors')
export class ErrorsController {
  constructor(private readonly store: AppStore) {}

  @Get()
  list() { return this.store.snapshot().errorList; }

  @Post()
  push(@Body() err: IErrorItem) {
    const item: IErrorItem = err.time ? err : { ...err, time: new Date().toISOString() };
    this.store.dispatch({ type: 'ERRORS/PUSH', payload: item });
    return { ok: true };
  }

  @Delete()
  clear() {
    this.store.dispatch({ type: 'ERRORS/CLEAR' });
    return { ok: true };
  }
}
