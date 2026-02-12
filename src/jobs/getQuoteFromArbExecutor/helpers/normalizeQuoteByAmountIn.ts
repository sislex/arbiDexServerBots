import { ISimulationStepsLogs } from '../../../store/state.types';

export function normalizeQuoteByAmountIn(
  quote: ISimulationStepsLogs,
  targetAmountIn: bigint
): ISimulationStepsLogs {
  if (quote.amountIn === 0n) {
    throw new Error('amountIn is zero, cannot normalize');
  }

  const amountOut =
    quote.amountOut * targetAmountIn / quote.amountIn;

  return {
    ...quote,
    amountIn: targetAmountIn,
    amountOut,
  };
}
