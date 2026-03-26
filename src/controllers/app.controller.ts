import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {
  selectJobTypesList, selectApis,
  selectAppVersion,
  selectBotsCount,
  selectBotsTypes,
  selectServerStartedAt, selectBotsRulesList, selectBotsList
} from '../store/selectors';
import {firstValueFrom} from 'rxjs';
import { AppStore } from '../store/app.store';
import {ApiEndpointDto} from '../store/dto/api-endpoint.dto';
import {IBot, IBotsRule} from '../store/state.types';
import {convertBigIntToString} from '../helpers/convertBigIntToString';
import {getV3PoolsFromFactory} from '../helpers/getPoolsByFactoryAddress/getV3PoolsFromFactory';
import {CAMELOT_V3_FACTORY, SUSHISWAP_V3_FACTORY, UNISWAP_V3_FACTORY} from '../helpers/dex.constants';
import { priceStore } from '../jobs/shared';

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

  @Get('getPoolsByFactoryUniswapV3')
  async getPools() {
    const pools = await getV3PoolsFromFactory(UNISWAP_V3_FACTORY, 0, 426085324);
    return pools;
  }

  // ── PriceStore API ──────────────────────────────────────

  /** GET /prices/keys — все ключи */
  @Get('prices/keys')
  getPriceKeys() {
    return priceStore.getSeriesKeys();
  }

  /** GET /prices/all — все данные по всем ключам */
  @Get('prices/all')
  getPricesAll() {
    const keys = priceStore.getSeriesKeys();
    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = priceStore.getSeries(key);
    }
    return result;
  }

  /** GET /prices/key/:key — серия по одному ключу */
  @Get('prices/key/:key')
  getPricesByKey(@Param('key') key: string) {
    return {
      key,
      points: priceStore.getSeries(key),
      count: priceStore.getSeries(key).length,
      last: priceStore.getLastPoint(key),
    };
  }

  /** POST /prices/keys — серии по списку ключей { keys: string[] } */
  @Post('prices/keys')
  getPricesByKeys(@Body() body: { keys: string[] }) {
    const result: Record<string, any> = {};
    for (const key of (body.keys ?? [])) {
      const series = priceStore.getSeries(key);
      result[key] = {
        points: series,
        count: series.length,
        last: priceStore.getLastPoint(key),
      };
    }
    return result;
  }

}
