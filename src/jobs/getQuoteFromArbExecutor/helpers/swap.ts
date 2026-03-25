import {IContractStep, ISimulationStepsLogs} from '../../../store/state.types';
import {ethers} from 'ethers';

export async function swap(
  swapSteps: IContractStep[],
  vault: ethers.Contract,
  isSimulation = true,
  profitToken?: string,
): Promise<ISimulationStepsLogs[]> {
  // profitToken — для замкнутого арбитражного цикла это tokenIn первого шага
  const token = profitToken ?? swapSteps[0].tokenIn;

  try {
    let simulationSummary, simulationLogs;

    if (isSimulation) {
      [simulationSummary, simulationLogs] = await vault.executeSwaps.staticCall(
        swapSteps,
        token,
        false,   // revertIfLoss
        false,   // emitEvents
      );
    } else {
      [simulationSummary, simulationLogs] = await vault.executeSwaps(
        swapSteps,
        token,
        true,    // revertIfLoss — для реального свопа revert при убытке
        true,    // emitEvents — эмитить события для аналитики
        {
          gasLimit: 1_200_000n,
        }
      );
    }

    const simulationStepsLogs: ISimulationStepsLogs[] = simulationLogs.map((log: ethers.Contract | null) => ({
      poolAddress: log![2],
      tokenIn: log![3],
      tokenOut: log![4],
      amountIn: log![5],
      amountOut: log![6],
      gas: log![7],
    }));

    return simulationStepsLogs;
  } catch (e: any) {
    console.error('error function swap:', e.reason ?? e.shortMessage ?? e.message);
    return [];
  }
}
