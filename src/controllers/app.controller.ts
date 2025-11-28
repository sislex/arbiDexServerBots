import { Controller, Get } from '@nestjs/common';
import {
  selectJobTypesList, selectApis,
  selectAppVersion,
  selectBotsCount,
  selectBotsTypes,
  selectServerStartedAt, selectBotsList, selectBotsRulesList
} from '../store/selectors';
import {firstValueFrom, take} from 'rxjs';
import { AppStore } from '../store/app.store';
import {ApiEndpointDto} from '../store/dto/api-endpoint.dto';
import {IBot, IBotsRule} from '../store/state.types';
import {getParamsFromBotInstance} from '../store/bots.halpers';
import {convertBigIntToString} from '../halpers/convertBigIntToString';

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

  @Get('info/job-type-list')
  async getActionsTypesList() {
    const jobTypes: string = await firstValueFrom(this.store.select$(selectJobTypesList));
    return jobTypes;
  }

  @Get('rules/get-all')
  async getAll() {
    const rulesList: IBotsRule[] = await firstValueFrom(this.store.select$(selectBotsRulesList));
    return convertBigIntToString(rulesList);
  }
}
