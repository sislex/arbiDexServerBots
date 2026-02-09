import {
  IContractStep,
  IQuote,
  IQuoteResult, SwapKind
} from '../../../store/state.types';
import {QuoteResultMulti} from '../../handlers';
import {ethers} from 'ethers';
import {configToStep} from './configToStep';
import {normalizeQuoteByAmountOut} from './normalizeQuoteByAmountOut';

export async function getQuotes(
  pairsToQuote: IQuote[],
  vault: ethers.Contract,
  ): Promise<QuoteResultMulti> {

  const startedAt = Date.now();

  // результат по всем парам
  const pairsToQuoteResults: IQuoteResult[] = pairsToQuote.map((pairToQuote: IQuote) => ({pairToQuote}));
  // массив промисов — по одному на каждую пару
  const tasks: Promise<void>[] = pairsToQuoteResults.map(async (item, i) => {
    // review
    let  simulationSummary, simulationLogs;
    try {
      const step: IContractStep = configToStep(item.pairToQuote);

      const revertedStep: IContractStep = {
        ...step,
        tokenIn: step.tokenOut,
        tokenOut: step.tokenIn,
        amountIn: 0n,
      };

      if (step.kind === SwapKind.V2_EXACT_IN) {
        revertedStep.path = [
          step.path[1],
          step.path[0],
        ];
      }

      const steps: IContractStep[] = [step, revertedStep];
      // console.log('steps', steps);

      [simulationSummary, simulationLogs] = await vault.executeSwaps.staticCall(
        steps,
        step.tokenOut,
        false,
        false,
      );

      let simulationStepsLogs = simulationLogs.map((log: ethers.Contract | null) => ({
        poolAddress: log![2],
        tokenIn: log![3],
        tokenOut: log![4],
        amountIn: log![5],
        amountOut: log![6],
        gas: log![7],
      }));

      if (simulationStepsLogs[simulationStepsLogs.length - 1].amountOut !== simulationStepsLogs[simulationStepsLogs.length - 2].amountIn) {
        const normalizedAmountOut = simulationStepsLogs[simulationStepsLogs.length - 2].amountIn;
        simulationStepsLogs[simulationStepsLogs.length - 1] = normalizeQuoteByAmountOut(simulationStepsLogs[simulationStepsLogs.length - 1], normalizedAmountOut);
      }

      item.simulationStepsLogs = simulationStepsLogs;
    } catch (e: any) {
      console.log('error', e);
      pairsToQuoteResults[i].error   = "V2_ROUTER_REVERT";
      pairsToQuoteResults[i].message = e?.shortMessage || e?.message || String(e);
      return;
    }
  });

  // ждём, пока все запросы завершатся
  await Promise.all(tasks);

  const latencyMs = Date.now() - startedAt;

  return {
    ok: true,
    latencyMs,
    result: pairsToQuoteResults,
  };
}
