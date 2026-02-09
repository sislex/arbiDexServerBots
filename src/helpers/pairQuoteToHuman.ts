import {IQuoteResult} from '../store/state.types';

export const pairQuoteToHuman = (pairQuote: IQuoteResult) => ({
  version: pairQuote.pairToQuote.version,
  dex: pairQuote.pairToQuote.dex,
  fee: pairQuote.pairToQuote.feePpm,
  poolAddress: pairQuote.pairToQuote.poolAddress,
  simulationStepsLogs: pairQuote.simulationStepsLogs,
})
