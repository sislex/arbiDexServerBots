// src/store/bots.controller.ts
import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import { AppStore } from '../store/app.store';
import type { IJobParams, IBotParams } from '../store/state.types';
import { IBot } from '../store/state.types';

import {selectBotsList} from '../store/selectors';
import {firstValueFrom, take} from 'rxjs';
import {getParamsFromBotInstance} from '../store/bots.halpers';
import {convertBigIntToString} from '../helpers/convertBigIntToString';
import {IArbitrage} from '../helpers/createArbitrage';
import {IBotError} from '../helpers/createError';
import {getParsedArbitrage, IParsedArbitrage} from '../helpers/getParsedArbitrage.helper';

@Controller('')
export class BotsController {
  constructor(private readonly store: AppStore) {}


  @Get('bots/get-all')
  async getAll() {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    return botsList.map((bot: IBot) => getParamsFromBotInstance(bot));
  }

  @Get('bot/:botId/params')
  async getBotParams(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    return getParamsFromBotInstance(bot);
  }

  @Get('bot/:botId/errors')
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
  async restartBot(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }
    bot.botInstance.restart();

    return { id: botId, restarted: true };
  }

  @Get('bot/:botId/arbitrage')
  async getBotArbitrage(@Param('botId') botId: string): Promise<IParsedArbitrage[]> {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot: IBot | undefined = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' } as any;
    }

    const arbitrageList: IArbitrage[] = bot.botInstance.getArbitrage().slice().reverse();

    return getParsedArbitrage(arbitrageList);
  }
}
