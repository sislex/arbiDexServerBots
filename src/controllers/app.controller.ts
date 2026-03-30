import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  selectJobTypesList, selectApis,
  selectAppVersion,
  selectBotsCount,
  selectBotsTypes,
  selectServerStartedAt, selectBotsRulesList,
} from '../store/selectors';
import {firstValueFrom} from 'rxjs';
import { AppStore } from '../store/app.store';
import {ApiEndpointDto} from '../store/dto/api-endpoint.dto';
import {IBotsRule} from '../store/state.types';
import {convertBigIntToString} from '../helpers/convertBigIntToString';
import {getV3PoolsFromFactory} from '../helpers/getPoolsByFactoryAddress/getV3PoolsFromFactory';
import {UNISWAP_V3_FACTORY} from '../helpers/dex.constants';

@ApiTags('info')
@Controller()
export class AppController {

  constructor(private readonly store: AppStore) {}

  @Get('info')
  @ApiOperation({ summary: 'Server info', description: 'Returns app version, server start time, and active bot count.' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        appVersion: { type: 'string', example: '0.0.1' },
        serverStartedAt: { type: 'string', example: '2026-03-31T12:00:00.000Z' },
        botsCount: { type: 'integer', example: 7 },
      },
    },
  })
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
  @ApiOperation({ summary: 'Bot types list', description: 'Returns all supported bot types (e.g. TestBot).' })
  async getBotsTypesList() {
    const botsTypes: string = await firstValueFrom(this.store.select$(selectBotsTypes));
    return botsTypes;
  }

  @Get('info/apis')
  @ApiOperation({ summary: 'Registered API endpoints', description: 'Returns the list of all API endpoints registered in the store.' })
  @ApiOkResponse({ type: [ApiEndpointDto] })
  async getApis() {
    const apis: ApiEndpointDto[] = await firstValueFrom(this.store.select$(selectApis));
    return apis;
  }

  @Get('info/job-type-list')
  @ApiOperation({ summary: 'Job types list', description: 'Returns all supported job types (get_Cex_Quotes, get_Dex_Quotes_By_Arb_Quoter, etc.).' })
  async getActionsTypesList() {
    const jobTypes: string = await firstValueFrom(this.store.select$(selectJobTypesList));
    return jobTypes;
  }

  @Get('rules/get-all')
  @ApiOperation({ summary: 'Get all bot rules', description: 'Returns the full botsRulesList configuration (id, botParams, jobParams per bot).' })
  async getAll() {
    const rulesList: IBotsRule[] = await firstValueFrom(this.store.select$(selectBotsRulesList));
    return convertBigIntToString(rulesList);
  }

  @Get('getPoolsByFactoryUniswapV3')
  @ApiOperation({ summary: 'Get Uniswap V3 pools from factory', description: 'Fetches V3 pool addresses from the Uniswap V3 factory contract on Arbitrum.' })
  async getPools() {
    return getV3PoolsFromFactory(UNISWAP_V3_FACTORY, 0, 426085324);
  }

}
