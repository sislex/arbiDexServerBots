import {IQuoteResult} from '../../../store/state.types';
function compareBigIntAsc(a: bigint, b: bigint): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareBigIntDesc(a: bigint, b: bigint): number {
  return a > b ? -1 : a < b ? 1 : 0;
}

export const sortQuotesByAmounts = (quotes: IQuoteResult[]) => {
  const safe = (q: IQuoteResult) => Array.isArray(q.simulationStepsLogs);

  const buy = quotes
    .filter((q) => safe(q) && q.simulationStepsLogs!.length > 0)
    // buy: simulationStepsLogs[0].amountOut desc (больше -> меньше)
    .sort((a, b) =>
      compareBigIntDesc(
        a.simulationStepsLogs![0].amountOut,
        b.simulationStepsLogs![0].amountOut
      )
    );

  const sell = quotes
    .filter((q) => safe(q) && q.simulationStepsLogs!.length > 1)
    // sell: simulationStepsLogs[1].amountIn asc (меньше -> больше)
    .sort((a, b) =>
      compareBigIntAsc(
        a.simulationStepsLogs![1].amountIn,
        b.simulationStepsLogs![1].amountIn
      )
    );

  return { buy, sell };
};
