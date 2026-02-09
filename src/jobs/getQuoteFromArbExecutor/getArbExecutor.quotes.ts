import {ethers} from 'ethers';
import {
  IContractStep,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes, ISimulationStepsLogs, SwapKind
} from '../../store/state.types';
import ArbExecutorAbi from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import {getQuotes} from './helpers/getQuotes';
import {QuoteResultMulti} from '../handlers';
import {sortQuotesByAmounts} from './helpers/sortQuotesByAmounts';
import {calcProfitPctFromBase} from './helpers/calcProfitPctFromBase';
import {calcProfitBaseSigned} from './helpers/calcProfitBaseSigned';
import {configToStep} from './helpers/configToStep';
import {swap} from './helpers/swap';
import {calcProfitPctFromTwoSwaps} from './helpers/calcProfitPctFromTwoSwaps';

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

  // Шаг 2: Сортировка пулов по лучшим котировкам
  const {buy, sell} = sortQuotesByAmounts(quotesResult.result);

 // Шаг 3: расчет прибыли обмена  в пулах с лучшими ценами покупки/продажи
  const bestBuyLog = buy[0].simulationStepsLogs![0];   // base -> quote
  const bestSellLog = sell[0].simulationStepsLogs![1];  // quote -> base (exactOut)
  const baseAmount = bestBuyLog.amountIn;      // amountIn первого шага
  const quoteOut   = bestBuyLog.amountOut;     // сколько получили quote
  const quoteIn    = bestSellLog.amountIn;      // сколько quote нужно, чтобы вернуть baseAmount
  const calcProfitBase: bigint = calcProfitBaseSigned({ baseAmount, quoteOut, quoteIn });
  const calcProfitPct = calcProfitPctFromBase(calcProfitBase, baseAmount);

  console.log('baseAmount', baseAmount);
  console.log('quoteOut', quoteOut);
  console.log('quoteIn', quoteIn);
  console.log('profitBase', calcProfitBase);
  console.log('profitPct', calcProfitPct);

  // Шаг 4: Симуляция
  const firstStep: IContractStep = {
    ...configToStep(buy[0].pairToQuote),
    amountOutMin: quoteOut,
  };

  const secondStep: IContractStep  = {
    ...configToStep(sell[0].pairToQuote),
    amountIn: 0n,
  };
  const tokenIn = secondStep.tokenOut;
  const tokenOut = secondStep.tokenIn;
  secondStep.tokenIn = tokenIn;
  secondStep.tokenOut = tokenOut;
  if (secondStep.kind === SwapKind.V2_EXACT_IN) {
    secondStep.path = [tokenIn, tokenOut];
  }

  const swapSteps = [firstStep, secondStep];
  console.log('swapSteps', swapSteps);

  const simulation: ISimulationStepsLogs[] = await swap(swapSteps, vault);
  console.log('simulation', simulation);

  const simulationCalcProfitBase: bigint = simulation[1].amountOut - simulation[0].amountIn;
  const simulationProfitPct = calcProfitPctFromTwoSwaps(simulation[0].amountIn, simulation[1].amountOut);

  console.log('simulationCalcProfitBase', simulationCalcProfitBase);
  console.log('simulationProfitPct', simulationProfitPct);

  return quotesResult;

}
