// src/store/bots.controller.ts
import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AppStore } from '../store/app.store';
import {IJobParams, IBotParams, IArbitrage, IBotsRule} from '../store/state.types';
import { IBot } from '../store/state.types';

import {selectBotsList} from '../store/selectors';
import {firstValueFrom} from 'rxjs';
import {getParamsFromBotInstance} from '../store/bots.halpers';
import {convertBigIntToString} from '../helpers/convertBigIntToString';
import {IBotError} from '../helpers/createError';
import {getParsedArbitrage} from '../helpers/getParsedArbitrage.helper';

@ApiTags('bots')
@Controller('')
export class BotsController {
  constructor(private readonly store: AppStore) {}

  @Get('bots/get-all')
  @ApiOperation({ summary: 'List all bots', description: 'Returns all active bots with their runtime state (id, running, jobCount, latency, errors, etc.).' })
  async getAll() {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    console.log('Getting all bots', botsList);
    return botsList.map((bot: IBot) => getParamsFromBotInstance(bot));
  }

  @Get('bot/:botId/params')
  @ApiOperation({ summary: 'Bot runtime parameters', description: 'Returns the runtime state of a specific bot.' })
  @ApiParam({ name: 'botId', description: 'Bot ID (e.g. "Binance_USDC_WETH")', example: 'Binance_USDC_WETH' })
  async getBotParams(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    return getParamsFromBotInstance(bot);
  }

  @Get('bot/:botId/errors')
  @ApiOperation({ summary: 'Bot error list', description: 'Returns the list of errors for a specific bot (newest first).' })
  @ApiParam({ name: 'botId', description: 'Bot ID', example: 'Binance_USDC_WETH' })
  async getBotErrors(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot: IBot | undefined = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    const errorList: IBotError[] = bot.botInstance.getErrors().slice().reverse();

    return errorList;
  }

  @Get('bot/:botId/settings')
  @ApiOperation({ summary: 'Bot settings', description: 'Returns botParams + jobParams configuration for a specific bot.' })
  @ApiParam({ name: 'botId', description: 'Bot ID', example: 'Binance_USDC_WETH' })
  async getBotSettings(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    return {
      id: botId,
      ...convertBigIntToString(bot.botInstance.getSettings())
    };
  }

  @Put('bot/:botId/settings')
  @ApiOperation({ summary: 'Update bot settings', description: 'Updates botParams and/or jobParams for a running bot. Both are JSON strings.' })
  @ApiParam({ name: 'botId', description: 'Bot ID', example: 'Binance_USDC_WETH' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        botParams: { type: 'string', description: 'JSON-encoded IBotParams', example: '{"botType":"TestBot","paused":false,"isRepeat":true,"delayBetweenRepeat":200,"maxJobs":1000000}' },
        jobParams: { type: 'string', description: 'JSON-encoded IJobParams', example: '{"jobType":"get_Cex_Quotes","source":"binance","symbol":"ETHUSDC"}' },
      },
      required: ['botParams', 'jobParams'],
    },
  })
  async putBotSettings(
    @Param('botId') botId: string,
    @Body('botParams') botParams: string,
    @Body('jobParams') jobParams: string,
    ) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    return {
      id: botId,
      ...bot.botInstance.setSettings(JSON.parse(botParams) as IBotParams, JSON.parse(jobParams) as IJobParams)
    }
  }

  @Post('bot/:botId/pause')
  @ApiOperation({ summary: 'Pause / resume bot', description: 'Pauses or resumes a bot. Send { "pause": true } to pause, { "pause": false } to resume.' })
  @ApiParam({ name: 'botId', description: 'Bot ID', example: 'Binance_USDC_WETH' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { pause: { type: 'boolean', example: true } },
      required: ['pause'],
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'Binance_USDC_WETH' },
        paused: { type: 'boolean', example: true },
      },
    },
  })
  async pauseBot(@Param('botId') botId: string, @Body('pause') pause: boolean) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }
    const paused = bot.botInstance.setPaused(pause);

    return { id: botId, paused };
  }

  @Post('bot/:botId/restart')
  @ApiOperation({ summary: 'Restart bot', description: 'Restarts a specific bot (stops and re-runs with current settings).' })
  @ApiParam({ name: 'botId', description: 'Bot ID', example: 'Binance_USDC_WETH' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'Binance_USDC_WETH' },
        restarted: { type: 'boolean', example: true },
      },
    },
  })
  async restartBot(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot: IBot | undefined = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' } as any;
    }
    bot.botInstance.restart();

    return { id: botId, restarted: true };
  }

  @Get('bot/:botId/arbitrage')
  @ApiOperation({ summary: 'Bot arbitrage results', description: 'Returns parsed arbitrage opportunities found by this bot (newest first).' })
  @ApiParam({ name: 'botId', description: 'Bot ID', example: 'Arbitrum_USDC_WETH' })
  async getBotArbitrage(@Param('botId') botId: string): Promise<any[]> {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot: IBot | undefined = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' } as any;
    }

    const arbitrageList: IArbitrage[] = bot.botInstance.getArbitrage().slice().reverse();

    // console.log(arbitrageList);

    // return convertBigIntToString(arbitrageList);
    return getParsedArbitrage(arbitrageList);
  }

  @Post('setBotsRulesList')
  @ApiOperation({
    summary: 'Replace all bot rules',
    description: 'Stops all current bots, clears the list, and starts new bots based on the provided rules. Each rule defines a bot with its botParams and jobParams.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        botsRulesList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'Binance_USDC_WETH' },
              botParams: {
                type: 'object',
                properties: {
                  botType: { type: 'string', example: 'TestBot' },
                  paused: { type: 'boolean', example: false },
                  isRepeat: { type: 'boolean', example: true },
                  delayBetweenRepeat: { type: 'integer', example: 200 },
                  maxJobs: { type: 'integer', example: 1000000 },
                  maxErrors: { type: 'integer', example: 100 },
                  timeoutMs: { type: 'integer', example: 30000 },
                },
              },
              jobParams: {
                type: 'object',
                properties: {
                  jobType: { type: 'string', example: 'get_Cex_Quotes' },
                  source: { type: 'string', example: 'binance' },
                  symbol: { type: 'string', example: 'ETHUSDC' },
                },
              },
            },
          },
        },
      },
      required: ['botsRulesList'],
    },
  })
  @ApiCreatedResponse({ schema: { type: 'boolean', example: true } })
  async setBotsRulesList(@Body('botsRulesList') botsRulesList: IBotsRule[]) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    botsList.forEach((bot: IBot) => {
      const paused = bot.botInstance.setPaused(true);
    });

    // console.log('botsRulesList', botsRulesList);

    this.store.dispatch({ type: 'BOTS_RULES_LIST/SET_ALL', payload: {botsRulesList: []} }); // reset bots list
    this.store.dispatch({ type: 'BOTS_RULES_LIST/SET_ALL', payload: {botsRulesList} });


    return true;
  }


}
