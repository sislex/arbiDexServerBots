import {IQuoteStepsResults} from '../../../store/state.types';
function compareBigIntAsc(a: bigint, b: bigint): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function compareBigIntDesc(a: bigint, b: bigint): number {
  return a > b ? -1 : a < b ? 1 : 0;
}

export const sortStepQuotes = (quoteStepsResults: IQuoteStepsResults[]) => {
  const safe = (q: IQuoteStepsResults) => Array.isArray(q.simulationStepsLogs);

  const sortedFirstStepQuotes:  IQuoteStepsResults[] = quoteStepsResults
    .filter((q) => safe(q) && !!q.quoteLog)
    // buy: simulationStepsLogs[0].amountOut desc (больше -> меньше)
    .sort((a: IQuoteStepsResults, b: IQuoteStepsResults) =>
      compareBigIntDesc(
        a.quoteLog!.amountOut,
        b.quoteLog!.amountOut
      )
    );



  return sortedFirstStepQuotes;
};
