// src/controllers/store.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppStore } from '../store/app.store';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly store: AppStore) {}

  @Get()
  @ApiOperation({
    summary: 'Full application state snapshot',
    description: 'Returns the complete in-memory application state including bots, rules, errors, apis, and metadata.',
  })
  getAll() { return this.store.snapshot(); }

}
