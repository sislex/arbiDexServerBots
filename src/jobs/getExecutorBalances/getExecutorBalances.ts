import { ethers } from 'ethers';
import { IJobParams_get_Executor_Balances } from '../../store/state.types';
import ArbExecutorAbi from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
import { fetchExecutorBalances } from './helpers/fetchExecutorBalances';

export interface TokenBalanceInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  rawBalance: string;
  formatted: string;
}

export interface ExecutorBalancesResult {
  ok: boolean;
  latencyMs: number;
  blockNumber: number;
  executorAddress: string;
  ethBalance: string;
  ethFormatted: string;
  tokens: TokenBalanceInfo[];
  error?: string;
}

export async function getExecutorBalances(
  params: IJobParams_get_Executor_Balances,
): Promise<ExecutorBalancesResult> {
  const totalStart = performance.now();
  const executorAddress = params.executorAddress || process.env.EXECUTOR_ADDRESS;
  const rpcUrl = params.rpcUrl || 'https://arb1.arbitrum.io/rpc';
  const pk = process.env.PRIVATE_KEY;

  if (!executorAddress) {
    return {
      ok: false, latencyMs: 0, blockNumber: 0, executorAddress: '',
      ethBalance: '0', ethFormatted: '0.0', tokens: [],
      error: 'EXECUTOR_ADDRESS не задан ни в params, ни в .env',
    };
  }

  if (!pk) {
    return {
      ok: false, latencyMs: 0, blockNumber: 0, executorAddress,
      ethBalance: '0', ethFormatted: '0.0', tokens: [],
      error: 'PRIVATE_KEY не задан в .env (нужен для owner-функций контракта)',
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(pk, provider);
    const executor = new ethers.Contract(executorAddress, ArbExecutorAbi.abi, wallet);

    const [blockNumber, { ethBal, tokens }] = await Promise.all([
      provider.getBlockNumber(),
      fetchExecutorBalances(executor, provider),
    ]);

    const totalMs = performance.now() - totalStart;

    return {
      ok: true,
      latencyMs: Math.round(totalMs),
      blockNumber,
      executorAddress,
      ethBalance: ethBal.toString(),
      ethFormatted: ethers.formatEther(ethBal),
      tokens,
    };
  } catch (err: any) {
    const totalMs = performance.now() - totalStart;
    return {
      ok: false,
      latencyMs: Math.round(totalMs),
      blockNumber: 0,
      executorAddress,
      ethBalance: '0',
      ethFormatted: '0.0',
      tokens: [],
      error: err.message ?? String(err),
    };
  }
}
