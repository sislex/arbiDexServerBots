import {ethers} from 'ethers';
import {
  IContractStep,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes, IQuote, ISimulationStepsLogs, SwapKind
} from '../../store/state.types';
import ArbExecutorAbi from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import {getQuotes} from './helpers/getQuotes';
import {QuoteResultMulti} from '../handlers';
import {calcProfitPctFromBase} from './helpers/calcProfitPctFromBase';
import {swap} from './helpers/swap';
import {calcProfitPctFromTwoSwaps} from './helpers/calcProfitPctFromTwoSwaps';
import {getStepsByQuotesResults} from './helpers/getStepsByQuotesResults';
import {configToStep} from './helpers/configToStep';
import {getQuotesFromLastStep, IQuoteStepsResults} from './helpers/getQuotesFromLastStep';
import {compareBigIntDesc, sortStepQuotes} from './helpers/sortQuotesByAmounts';
import {revertConfigToStep} from './helpers/revertConfigToStep';

const VAULT = "0x25499918EdD7aB818F29c01045fCc4b4fdCAB5Cf";

export async function getArbExecutorQuotes(
  params: IJobParams_get_Arbitrum_Arb_Executor_Quotes,
): Promise<any> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const pk = process.env.PRIVATE_KEY!;
  const signer = new ethers.Wallet(pk, provider);
  const vault = new ethers.Contract(VAULT, ArbExecutorAbi.abi, signer);



  // Шаг 1: получение шагов для котировок
  const quoteSteps: IContractStep[][] = pairsToQuote.map((quote: IQuote) => [configToStep(quote)]);

  // Шаг 2: получение котировок для последнего шага
  const firstStepQuotes = await getQuotesFromLastStep(quoteSteps, vault, provider);
  const firstStepQuotesResult: IQuoteStepsResults[] = firstStepQuotes.result;
  // console.log('firstStepQuotesResult', firstStepQuotesResult);

  // Шаг 3: Сортируем котировки по лучшей цене
  const sortedFirstStepQuotes = sortStepQuotes(firstStepQuotesResult);
  // console.log('sortedFirstStepQuotes', sortedFirstStepQuotes);

  // Шаг 3: 1 step с лучшей ценой
  const firstStep: IContractStep = sortedFirstStepQuotes[0].quoteStep[0];

  // Шаг 4: получение шагов для симуляции на покупку/продажу
  const simulationSeps: IContractStep[][] = pairsToQuote.map((quote: IQuote) => [
    firstStep,
    {
      ...revertConfigToStep(configToStep(quote)),
      amountIn: 0n,
    }
  ]);

  // Шаг 5: симуляция
  const swapSimulation = await getQuotesFromLastStep(simulationSeps, vault, provider);
  const simulationSepsResult: IQuoteStepsResults[] = swapSimulation.result;

  // console.log('simulationSepsResult', simulationSepsResult);
  const simulationSepsResultMapped: IQuoteStepsResults[] = simulationSepsResult.map(item => {
    const baseAmountIn = item.simulationStepsLogs![0].amountIn;
    const baseAmountOut = item.simulationStepsLogs![1].amountOut;
    const profitBase: bigint = baseAmountOut - baseAmountIn;
    const profitPct: number = calcProfitPctFromBase(profitBase, baseAmountIn);
    const gas: bigint = item.simulationStepsLogs![0].gas +  item.simulationStepsLogs![1].gas;
    return {
      quoteStep: item.quoteStep,
      profitBase,
      profitPct,
      gas,
    };
  });

  // Шаг 5: сортируем по profitBase
  simulationSepsResultMapped.sort((a: IQuoteStepsResults, b: IQuoteStepsResults) =>
    compareBigIntDesc(
      a.profitBase!,
      b.profitBase!
    )
  )

  const profitSimulationSepsResult = simulationSepsResultMapped.filter(iitem => iitem.profitBase! > 0);

  console.log('simulationSepsResultMapped', simulationSepsResultMapped);
  console.log('swapSimulation.blockNumber', swapSimulation.blockNumber);
  console.log('swapSimulation.latencyMs', swapSimulation.latencyMs);

  console.log('profitSimulationSepsResult', profitSimulationSepsResult.map(item => ({
    profitBase: item.profitBase!,
    profitPct: item.profitPct!,
  })));

  return [];

}
