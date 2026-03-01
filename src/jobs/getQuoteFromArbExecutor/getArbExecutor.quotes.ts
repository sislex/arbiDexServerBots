import {ethers} from 'ethers';
import {
  IContractStep,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes, IQuote, IQuoteStepsResults, ISimulationStepsLogs
} from '../../store/state.types';
import ArbExecutorAbi from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import {calcProfitPctFromBase} from './helpers/calcProfitPctFromBase';
import {configToStep} from './helpers/configToStep';
import {getQuotesFromLastStep} from './helpers/getQuotesFromLastStep';
import {compareBigIntDesc, sortStepQuotes} from './helpers/sortQuotesByAmounts';
import {revertConfigToStep} from './helpers/revertConfigToStep';
import {getQuotesFromLastStepViaMulticall} from './helpers/getQuotesFromLastStepViaMulticall';
import {groupQuotesResults} from './helpers/groupQuotesResults';
import {swap} from './helpers/swap';
import {poolConfigToStoreStep} from './helpers/poolConfigToStoreSteps';

export interface IGroupedQuotesResults {
  [key: string]: IQuoteStepsResults[];
}

const VAULT = "0x6BD3aF9Db01880B1DE8B8AfDb7fEc91013E05973";

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
  console.log('-------------------------------------------');
  const blockNumber = await provider.getBlockNumber();

  // Шаг 1: получение шагов для котировок
  // const quoteSteps: IContractStep[][] = poolConfigToStoreStep(pairsToQuote);

  // return {
  //   result: mappedResult,
  // };
}
