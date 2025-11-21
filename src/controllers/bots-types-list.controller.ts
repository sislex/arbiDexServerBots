// src/store/bots-types-list.controller.ts
import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import { AppStore } from '../store/app.store';
import type { IJobParams, IBotParams } from '../store/state.types';
import { IBot, IBotType } from '../store/state.types';

import {selectBotsList} from '../store/selectors';
import {firstValueFrom, take} from 'rxjs';
import {getParamsFromBotInstance} from '../store/bots.halpers';

@Controller('')
export class BotsTypesController {
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

  @Get('bot/:botId/settings')
  async getBotSettings(@Param('botId') botId: string) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    return {
      id: botId,
      ...bot.botInstance.getSettings()
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
  async pauseBot(@Param('botId') botId: string, @Body() pause: boolean) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }
    bot.botInstance.setPaused(pause);

    return { id: botId, paused: pause };
  }
}
