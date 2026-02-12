import {ethers} from 'ethers';
import {
  IContractStep,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes, ISimulationStepsLogs, SwapKind
} from '../../store/state.types';
import ArbExecutorAbi from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import {getQuotes} from './helpers/getQuotes';
import {QuoteResultMulti} from '../handlers';
import {calcProfitPctFromBase} from './helpers/calcProfitPctFromBase';
import {swap} from './helpers/swap';
import {calcProfitPctFromTwoSwaps} from './helpers/calcProfitPctFromTwoSwaps';
import {getStepsByQuotesResults} from './helpers/getStepsByQuotesResults';

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

  // Шаг 1: получение котировок
  const quotesResult: QuoteResultMulti =  await getQuotes(pairsToQuote, vault);
  console.log('quotes', quotesResult.result.map(quote => ({
    pairToQuote: quote.pairToQuote,
    step0: quote.simulationStepsLogs![0],
    step1: quote.simulationStepsLogs![1],
  })));

  // Шаг 2: получение шагов для свопа
  const swapSteps = getStepsByQuotesResults(quotesResult.result);
  console.log('swapSteps', swapSteps);

 // Шаг 3: расчет прибыли обмена  в пулах с лучшими ценами покупки/продажи
  const baseAmountIn = swapSteps[0].amountIn;      // amountIn первого шага
  const baseAmountOut   = swapSteps[1].amountOutMin;     // сколько получили quote
  const calcProfitBase: bigint = baseAmountOut - baseAmountIn;
  const calcProfitPct = calcProfitPctFromBase(calcProfitBase, baseAmountIn);

  console.log('baseAmountIn', baseAmountIn);
  console.log('baseAmountOut', baseAmountOut);
  console.log('calcProfitBase', calcProfitBase);
  console.log('calcProfitPct', calcProfitPct);

  // Шаг 4: Симуляция
  const simulationSteps = [...swapSteps.map((item: IContractStep) => ({
    ...item,
    amountOutMin: 0n,
  }))];
  // simulationSteps[1].amountIn = 0n;
  console.log('simulationSteps', simulationSteps);

  const simulation: ISimulationStepsLogs[] = await swap(simulationSteps, vault);
  console.log('simulation', simulation);

  const simulationProfitBase: bigint = simulation[1].amountOut - simulation[0].amountIn;
  const simulationProfitPct = calcProfitPctFromTwoSwaps(simulation[0].amountIn, simulation[1].amountOut);


  console.log('baseAmountIn', baseAmountIn);
  console.log('baseAmountOut', baseAmountOut);
  console.log('calcProfitBase', calcProfitBase);
  console.log('calcProfitPct', calcProfitPct);
  console.log('simulationCalcProfitBase', simulationProfitBase);
  console.log('simulationProfitPct', simulationProfitPct);
  console.log('simulationProfitPct', simulationProfitPct);

  return quotesResult;

}
