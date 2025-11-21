import {IBot} from './state.types';

export const getParamsFromBotInstance = (bot: IBot)=> ({
  id: bot.id,
  running: bot.botInstance.running,
  createdAt: bot.botInstance.createdAt,
  jobCount: bot.botInstance.jobCount,
  errorCount: bot.botInstance.errorCount,
  lastJobTimeStart: bot.botInstance.lastJobTimeStart,
  lastJobTimeFinish: bot.botInstance.lastJobTimeFinish,
  lastLatency: bot.botInstance.lastLatency,
  lastJobResult: bot.botInstance.lastJobResult,
})
