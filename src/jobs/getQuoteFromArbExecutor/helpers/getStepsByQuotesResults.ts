import {IContractStep, IQuoteResult, SwapKind} from '../../../store/state.types';
import {configToStep} from './configToStep';
import {normalizeQuoteByAmountIn} from './normalizeQuoteByAmountIn';

function compareBigIntAsc(a: bigint, b: bigint): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareBigIntDesc(a: bigint, b: bigint): number {
  return a > b ? -1 : a < b ? 1 : 0;
}

export function getStepsByQuotesResults(quotes: IQuoteResult[]): IContractStep[] {
  const safe = (q: IQuoteResult) => Array.isArray(q.simulationStepsLogs);

  const buyQuotes: IQuoteResult[] = quotes
    .filter((q) => safe(q) && q.simulationStepsLogs!.length > 0)
    // buy: simulationStepsLogs[0].amountOut desc (больше -> меньше)
    .sort((a, b) =>
      compareBigIntDesc(
        a.simulationStepsLogs![0].amountOut,
        b.simulationStepsLogs![0].amountOut
      )
    );

  const bestBuyQuote: IQuoteResult = buyQuotes[0];
  const firstStep: IContractStep = configToStep(bestBuyQuote.pairToQuote);
  firstStep.amountOutMin = bestBuyQuote.simulationStepsLogs![0].amountOut;
  const sellAmountIn = firstStep.amountOutMin;

  const sellQuotes: IQuoteResult[] = quotes
    .filter((q) => safe(q) && q.simulationStepsLogs!.length > 1)
    .map((q: IQuoteResult) => {
      const simulationStepsLogs = q.simulationStepsLogs!;
      if (simulationStepsLogs[simulationStepsLogs.length - 1].amountOut !== simulationStepsLogs[simulationStepsLogs.length - 2].amountIn) {
        simulationStepsLogs[simulationStepsLogs.length - 1] = normalizeQuoteByAmountIn(simulationStepsLogs[simulationStepsLogs.length - 1], sellAmountIn);
      }
      return {...q, simulationStepsLogs};
    })
    // sell: simulationStepsLogs[1].amountIn asc (меньше -> больше)
    .sort((a, b) =>
      compareBigIntDesc(
        a.simulationStepsLogs![1]. amountOut,
        b.simulationStepsLogs![1]. amountOut
      )
    );

  console.log('sellQuotes', sellQuotes.map(quote => ({
    pairToQuote: quote.pairToQuote,
    step0: quote.simulationStepsLogs![0],
    step1: quote.simulationStepsLogs![1],
  })));

  const bestSellQuote: IQuoteResult = sellQuotes[0];
  const secondStep: IContractStep = configToStep(bestSellQuote.pairToQuote);
  const tokenIn = secondStep.tokenOut;
  const tokenOut = secondStep.tokenIn;
  secondStep.tokenIn = tokenIn;
  secondStep.tokenOut = tokenOut;
  secondStep.amountIn = sellAmountIn;
  secondStep.amountOutMin = bestSellQuote.simulationStepsLogs![1].amountOut;
  if (secondStep.kind === SwapKind.V2_EXACT_IN) {
    secondStep.path = [tokenIn, tokenOut];
  }

  const swapSteps: IContractStep[] = [firstStep, secondStep];

  return swapSteps;
}
