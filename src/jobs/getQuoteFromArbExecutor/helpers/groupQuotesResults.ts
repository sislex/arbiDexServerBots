import {IContractStep, IQuoteStepsResults} from '../../../store/state.types';
import {IGroupedQuotesResults} from '../getArbExecutor.quotes';

export const groupQuotesResults = (quoteStepsResults: IQuoteStepsResults[], filterIfOne = false): IGroupedQuotesResults => {
  const groupedQuotesResults: IGroupedQuotesResults = {} as IGroupedQuotesResults;

  quoteStepsResults.forEach((quoteStepsResult: IQuoteStepsResults)=> {
    const step: IContractStep = quoteStepsResult.quoteStep![0];
    const key: string = `${step.tokenIn}|${step.tokenOut}|${step.amountIn}`;
    if (!groupedQuotesResults[key]) {
      groupedQuotesResults[key] = [];
    }

    groupedQuotesResults[key].push(quoteStepsResult);
  });

  if (filterIfOne) {
    for (const key in groupedQuotesResults) {
      if (groupedQuotesResults[key].length < 2) {
        delete groupedQuotesResults[key];
      }
    }
  }


  return groupedQuotesResults;
};
