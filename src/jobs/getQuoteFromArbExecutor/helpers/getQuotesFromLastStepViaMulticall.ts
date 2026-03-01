import { ethers } from "ethers";
import {
  IContractStep,
  IQuoteStepsResults,
  ISimulationStepsLogs,
} from "../../../store/state.types";
import { QuoteResultMulti } from "../../handlers";

// ABI твоего OwnerMulticall
const OWNER_MULTICALL_ABI = [
  "function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) returns (tuple(bool success,bytes returnData)[] results)",
];

const ownerMulticallAddress = '0x3E506CDa6Bb473A58a11fED3C1e592E4eE33CcB6';

type MulticallCall3 = {
  target: string;
  allowFailure: boolean;
  callData: string;
};

type MulticallResult = {
  success: boolean;
  returnData: string;
};

export async function getQuotesFromLastStepViaMulticall(
  quoteSteps: IContractStep[][],
  vault: ethers.Contract,                 // ArbExecutor (с simulateSwaps + error Simulated)
  signer: ethers.Wallet,
  provider: ethers.JsonRpcProvider,
): Promise<QuoteResultMulti> {
  const startedAt = Date.now();

  const quoteStepsResults: IQuoteStepsResults[] = quoteSteps.map((quoteStep) => ({
    quoteStep,
  }));

  const ownerMulticall = new ethers.Contract(
    ownerMulticallAddress,
    OWNER_MULTICALL_ABI,
    signer
  );

  // Собираем calls: simulateSwaps(steps, profitToken, revertIfLoss)
  // profitToken = steps[0].tokenOut (как у тебя раньше)
  // revertIfLoss = false (как ты просил)
  const calls: MulticallCall3[] = quoteSteps.map((steps) => ({
    target: vault.target as string,
    allowFailure: true,
    callData: vault.interface.encodeFunctionData("simulateSwaps", [
      steps,
      steps[0].tokenOut,
      false,
    ]),
  }));

  const blockNumber = await provider.getBlockNumber();

  // Один eth_call на весь батч
  const OWNER_EOA = "0x90F0fE019Dd68e4bF4dacA998f00C758F7DF4ADE";

  let results: MulticallResult[];
  try {
    results = await ownerMulticall.aggregate3.staticCall(calls, { from: OWNER_EOA });
  } catch (e: any) {
    console.log("[MC] aggregate3.staticCall FAILED:", e?.shortMessage ?? e?.message ?? e);

    const data = e?.data ?? e?.info?.error?.data;
    if (data) {
      try {
        const parsed = ownerMulticall.interface.parseError(data);
        console.log("[MC] OwnerMulticall error:", parsed?.name, parsed?.args);
      } catch {}
    }
    throw e;
  }

  // Разбираем результаты по каждой паре
  for (let i = 0; i < results.length; i++) {
    const r = results[i];

    // simulateSwaps всегда revert => success обычно false
    // но если вдруг success=true — просто пропустим/попробуем декодить как return (у тебя return нет)
    if (r.returnData === "0x") {
      // вообще ничего не вернулось
      continue;
    }

    try {
      // Парсим revert-data как custom error
      const parsed = vault.interface.parseError(r.returnData);

      if (parsed?.name === "Simulated") {
        // error Simulated(ArbSummary summary, SwapLog[] logs);
        const summary = parsed.args[0];
        const logs = parsed.args[1];

        // logs: SwapLog[] => маппим в твой ISimulationStepsLogs
        const simulationStepsLogs: ISimulationStepsLogs[] = (logs as any[]).map(
          (log: any) => ({
            // SwapLog:
            // 0 index, 1 kind, 2 target, 3 tokenIn, 4 tokenOut, 5 amountIn, 6 amountOut, 7 gasUsed
            poolAddress: log[2],
            tokenIn: log[3],
            tokenOut: log[4],
            amountIn: log[5],
            amountOut: log[6],
            gas: log[7],
          })
        );

        quoteStepsResults[i].simulationStepsLogs = simulationStepsLogs;
        quoteStepsResults[i].quoteLog =
          simulationStepsLogs[simulationStepsLogs.length - 1];

        // если хочешь — можешь сохранить summary тоже
        // quoteStepsResults[i].simulationSummary = summary;
      } else {
        // Это реальная ошибка (DEADLINE_EXPIRED, LOSS_EXCEEDS_LIMIT, etc.)
        // Можно логировать parsed.name для отладки:
        // console.log("route failed:", i, parsed?.name, parsed?.args);
      }
    } catch (e) {
      // parseError может упасть если revert-data не соответствует ABI vault
      // console.log("decode error:", i, e);
      continue;
    }
  }

  const latencyMs = Date.now() - startedAt;

  return {
    ok: true,
    latencyMs,
    blockNumber: blockNumber,
    result: quoteStepsResults,
  };
}
