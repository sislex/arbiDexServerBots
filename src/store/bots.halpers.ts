import {IBot} from './state.types';
import {convertBigIntToString} from '../halpers/convertBigIntToString';

export const getParamsFromBotInstance = (bot: IBot)=> ({
  id: bot.id,
  running: bot.botInstance.botState.running,
  createdAt: bot.botInstance.botState.createdAt,
  jobCount: bot.botInstance.botState.jobCount,
  errorCount: bot.botInstance.botState.errorCount,
  lastJobTimeStart: bot.botInstance.botState.lastJobTimeStart,
  lastJobTimeFinish: bot.botInstance.botState.lastJobTimeFinish,
  lastLatency: bot.botInstance.botState.lastLatency,
  lastJobResult: convertBigIntToString(bot.botInstance.botState.lastJobResult),
})
