import {IContractStep, ISimulationStepsLogs} from '../../../store/state.types';
import {ethers} from 'ethers';

export async function swap(
  swapSteps: IContractStep[],
  vault: ethers.Contract,
): Promise<ISimulationStepsLogs[]> {
  console.log('swapSteps', swapSteps);

  try {
    const [simulationSummary, simulationLogs] = await vault.executeSwaps.staticCall(
      swapSteps,
      swapSteps[0].tokenOut,
      false,
      false,
    );

    let simulationStepsLogs: ISimulationStepsLogs[] = simulationLogs.map((log: ethers.Contract | null) => ({
      poolAddress: log![2],
      tokenIn: log![3],
      tokenOut: log![4],
      amountIn: log![5],
      amountOut: log![6],
      gas: log![7],
    }));

    // console.log('simulationStepsLogs', simulationStepsLogs);
    // console.log('simulationSummary', simulationSummary);

    return simulationStepsLogs;
  } catch (e: any) {
    console.log('error', e);
    return [];
  }
}
