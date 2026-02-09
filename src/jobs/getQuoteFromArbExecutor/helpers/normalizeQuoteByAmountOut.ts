import {ISimulationStepsLogs} from '../../../store/state.types';

export function normalizeQuoteByAmountOut(
  quote: ISimulationStepsLogs,
  targetAmountOut: bigint
): ISimulationStepsLogs {
  if (quote.amountOut === 0n) {
    throw new Error('amountOut is zero, cannot normalize');
  }

  const amountIn = quote.amountIn * targetAmountOut / quote.amountOut;

  return {
    ...quote,
    amountIn,
    amountOut: targetAmountOut,
  };
}
