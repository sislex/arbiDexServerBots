import {IBot} from './state.types';

export const getParamsFromBotInstance = (bot: IBot)=> ({
  id: bot.id,
  running: bot.botInstance.running,
  createdAt: bot.botInstance.createdAt,
  actionCount: bot.botInstance.actionCount,
  errorCount: bot.botInstance.errorCount,
  lastActionTimeStart: bot.botInstance.lastActionTimeStart,
  lastActionTimeFinish: bot.botInstance.lastActionTimeFinish,
  lastLatency: bot.botInstance.lastLatency,
  lastActionResult: bot.botInstance.lastActionResult,
})
