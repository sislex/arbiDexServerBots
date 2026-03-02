import {
  IContractStep, IQuoteStepsResults,
  ISimulationStepsLogs
} from '../../../store/state.types';
import {QuoteResultMulti} from '../../handlers';
import {ethers} from 'ethers';

export async function getQuotesFromLastStep(
  quoteSteps: IContractStep[][],
  vault: ethers.Contract,
  provider: ethers.JsonRpcProvider,
  isSimulation = true,
): Promise<QuoteResultMulti> {

  const startedAt = Date.now();

  // результат по всем парам
  const quoteStepsResults: IQuoteStepsResults[] = quoteSteps.map((quoteStep: IContractStep[]) => ({
    quoteStep,
  }));
  // массив промисов — по одному на каждую пару
  const tasks: Promise<ISimulationStepsLogs[]>[] = quoteSteps.map(async (steps: IContractStep[], i): Promise<ISimulationStepsLogs[]> => {
    // review
    let  simulationSummary, simulationLogs;
    try {
      [simulationSummary, simulationLogs] = await vault.executeSwaps.staticCall(
        steps,
        steps[0].tokenOut,
        false,
        false,
      );

      const simulationStepsLogs: ISimulationStepsLogs[] = simulationLogs.map((log: ethers.Contract | null) => ({
        poolAddress: log![2],
        tokenIn: log![3],
        tokenOut: log![4],
        amountIn: log![5],
        amountOut: log![6],
        gas: log![7],
      }));

      quoteStepsResults[i].simulationStepsLogs = simulationStepsLogs;
      quoteStepsResults[i].quoteLog = simulationStepsLogs[simulationStepsLogs.length - 1];

      return await simulationStepsLogs;
    } catch (e: any) {
      console.log('error', e);
      return [];
    }
  });

  const blockNumberPromise: Promise<number> = provider.getBlockNumber();

  // ждём, пока все запросы завершатся
  const stepsResultPromise: Promise<ISimulationStepsLogs[][]> = Promise.all(tasks);

  const promises: [ISimulationStepsLogs[][], number] = await Promise.all([stepsResultPromise, blockNumberPromise])

  const blockNumber: number = promises[1];
  const latencyMs = Date.now() - startedAt;

  return {
    ok: true,
    latencyMs,
    blockNumber,
    result: quoteStepsResults,
  };
}
