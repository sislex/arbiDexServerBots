// src/store/bots-types-list.controller.ts
import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import { AppStore } from '../store/app.store';
import type { IActionParams, IBotParams } from '../store/state.types';
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
    @Body('botParams') botParams: IBotParams,
    @Body('actionParams') actionParams: IActionParams,
    ) {
    const botsList: IBot[] = await firstValueFrom(this.store.select$(selectBotsList));
    const bot = botsList.find((b: IBot) => b.id === botId);
    if (!bot) {
      return { error: 'Bot not found' };
    }

    return {
      id: botId,
      ...bot.botInstance.setSettings(botParams, actionParams)
    }
  }

  @Post()
  addOrUpsert(@Body() item: IBotType) {
    this.store.dispatch({ type: 'BOTS_TYPES/UPSERT_ONE', payload: item });
    return this.store.snapshot().botsTypesList;
  }

  @Delete(':type')
  remove(@Param('type') type: string) {
    this.store.dispatch({ type: 'BOTS_TYPES/REMOVE_ONE', payload: { type } });
    return { ok: true };
  }
}
