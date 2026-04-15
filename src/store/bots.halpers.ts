import {IBot} from './state.types';
import {convertBigIntToString} from '../helpers/convertBigIntToString';

export const getParamsFromBotInstance = (bot: IBot)=> ({
  id: bot.id,
  description: bot.botInstance,
  running: bot.botInstance.botState.running,
  createdAt: bot.botInstance.botState.createdAt,
  jobCount: bot.botInstance.botState.jobCount,
  errorCount: bot.botInstance.botState.errors.length,
  lastJobTimeStart: bot.botInstance.botState.lastJobTimeStart,
  lastJobTimeFinish: bot.botInstance.botState.lastJobTimeFinish,
  latency: bot.botInstance.botState.latency,
  lastLatency: bot.botInstance.botState.lastLatency,
  lastJobResult: convertBigIntToString(bot.botInstance.botState.lastJobResult),
  arbitrageCount: bot.botInstance.botState.arbitrageList.length,
})
