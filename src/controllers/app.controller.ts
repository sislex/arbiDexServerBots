import { Controller, Get } from '@nestjs/common';
import {
  selectActionsTypesList, selectApis,
  selectAppVersion,
  selectBotsCount,
  selectBotsTypes,
  selectServerStartedAt
} from '../store/selectors';
import {firstValueFrom, take} from 'rxjs';
import { AppStore } from '../store/app.store';
import {ApiEndpointDto} from '../store/dto/api-endpoint.dto';

@Controller()
export class AppController {

  constructor(private readonly store: AppStore) {}

  @Get('info')
  async getInfo(): Promise<{ appVersion: string, serverStartedAt: string, botsCount: number }> {
    const appVersion: string = await firstValueFrom(this.store.select$(selectAppVersion));
    const serverStartedAt: string = await firstValueFrom(this.store.select$(selectServerStartedAt));
    const botsCount: number = await firstValueFrom(this.store.select$(selectBotsCount));
    return {
      appVersion,
      serverStartedAt,
      botsCount,
    };
  }

  @Get('info/bots-types-list')
  async getBotsTypesList() {
    const botsTypes: string = await firstValueFrom(this.store.select$(selectBotsTypes));
    return botsTypes;
  }

  @Get('info/apis')
  async getApis() {
    const apis: ApiEndpointDto[] = await firstValueFrom(this.store.select$(selectApis));
    return apis;
  }

  @Get('info/bots-actions-list')
  async getActionsTypesList() {
    const actionsTypes: string = await firstValueFrom(this.store.select$(selectActionsTypesList));
    return actionsTypes;
  }
}
