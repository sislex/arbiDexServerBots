// src/controllers/ui-errors.controller.ts
import { Controller, Delete, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppStore } from '../store/app.store';
import type { IErrorItem } from '../store/state.types';

@ApiTags('errors')
@Controller('errors')
export class ErrorsController {
  constructor(private readonly store: AppStore) {}

  @Get()
  @ApiOperation({ summary: 'List all errors', description: 'Returns the error list from the application state.' })
  list() { return this.store.snapshot().errorList; }

  @Get('pushError')
  @ApiOperation({ summary: 'Push test error', description: 'Creates a test error entry in the store (for debugging).' })
  @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } } })
  push() {
    const errorMessage = 'test';
    const item: IErrorItem = { time: new Date().toISOString(), errorMessage };
    this.store.dispatch({ type: 'ERRORS/PUSH', payload: item });
    return { ok: true };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all errors', description: 'Removes all error entries from the store.' })
  @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } } })
  clear() {
    this.store.dispatch({ type: 'ERRORS/CLEAR' });
    return { ok: true };
  }
}
