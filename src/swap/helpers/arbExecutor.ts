import {ethers, Interface} from 'ethers';
import ArbExecutorAbi from "../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json";
import {calcProfitPctFromLogs} from '../../helpers/calcProfitPctFromLogs';
import {fetchAllFromArbiscanByTxHash} from '../../helpers/arbiscan.helpers';
import {ITwoStepsConfig} from '../../store/state.types';

const VAULT = "0xe76fF183A7d5895f9754C4265e527D8442A0Ae34";
const RPC = "https://arb1.arbitrum.io/rpc";

const arbExecutorIface = new Interface(ArbExecutorAbi.abi);


async function preflightExecuteSwaps(
  vault: ethers.Contract,
  stepsForRealTx: any[],
  profitToken: string,
  revertIfLoss: boolean,
  emitEvents: boolean
) {
  try {
    const gas = await vault.executeSwaps.estimateGas(
      stepsForRealTx,
      profitToken,
      revertIfLoss,
      emitEvents
    );

    return { ok: true as const, gas };
  } catch (e: any) {
    return { ok: false as const, decoded: decodeRevert(e), raw: e };
  }
}

function decodeRevert(error: any) {
  // ethers v6: revert data может лежать в разных местах
  const data =
    error?.data ||
    error?.error?.data ||
    error?.receipt?.revertReason ||
    error?.info?.error?.data;

  if (!data || typeof data !== "string") {
    return {
      type: "UNKNOWN",
      message: error?.message ?? "Unknown error",
    };
  }

  try {
    const decoded = arbExecutorIface.parseError(data);

    return {
      type: "CUSTOM_ERROR",
      name: decoded?.name,
      args: decoded?.args,
    };
  } catch {
    return {
      type: "RAW_REVERT",
      data,
    };
  }
}

export async function arbExecutor(steps: ITwoStepsConfig, profitToken: string, minSpreadPctForSwap = 0.03, executeReaSwaps = true, contractAddress = VAULT) {
  const provider = new ethers.JsonRpcProvider(RPC);

  const pk = process.env.PRIVATE_KEY!;
  const signer = new ethers.Wallet(pk, provider);

  const vault = new ethers.Contract(contractAddress, ArbExecutorAbi.abi, signer);

  // preview
  let  simulationSummary, simulationLogs, simulationStepsLogs, simulationLatency, simulationSpreadPct, profitPct;
  try {
    const simulationTimeStart = new Date();

    // console.log('steps', steps);

    [simulationSummary, simulationLogs] = await vault.executeSwaps.staticCall(
      steps,
      profitToken,
      false,
      false,
    );

    const simulationTimeFinish = new Date();
    simulationLatency = simulationTimeFinish.getTime() - simulationTimeStart.getTime();

    simulationStepsLogs = simulationLogs.map((log: ethers.Contract | null) => ({
      poolAddress: log![2],
      tokenIn: log![3],
      tokenOut: log![4],
      amountIn: Number(log![5]),
      amountOut: Number(log![6]),
      gas: Number(log![7]),
    }));

    // console.log('simulationSummary', simulationSummary);
    // console.log('simulationStepsLogs', simulationStepsLogs);


    const inAmount: bigint = steps[0].amountIn;
    const outAmount: bigint = BigInt(simulationLogs[1][6]);
    // profit in PPM (1e6)
    const profitPpm: bigint = ((outAmount - inAmount) * 1_000_000n) / inAmount;
    profitPct = Number(profitPpm) / 10_000;
    // console.log(`Симуляция: block: ${Number(simulationSummary[0])}, профит ${profitPpm} ppm (${profitPct} %)`);
    simulationSpreadPct = calcProfitPctFromLogs(simulationLogs);

  } catch (error: any) {
    // 1. Попытка достать понятную причину ошибки (require/revert)
    const reason = error?.reason || error?.data?.message || error?.message;

    console.error("Симуляция провалилась!");
    console.error("Причина:", reason);

    // 2. Дополнительно можно проверить специфичные данные ошибки (error.data)
    if (error.code === 'CALL_EXCEPTION') {
      console.error("Ошибка исполнения контракта (Revert)");
    }
  }

  // config for real tx
  const SLIPPAGE_BPS = 30n; // 0.30%

  const minOut = (out: bigint) => (out * (10_000n - SLIPPAGE_BPS)) / 10_000n;

  const stepsForRealTx = [
    { ...steps[0], amountOutMin: minOut(BigInt(simulationLogs[0][6])) },
    { ...steps[1], amountOutMin: minOut(BigInt(simulationLogs[1][6])) },
  ];

  // real tx

  let  tx, receipt, txSummary, txLogs, txStepsLogs, txLatency, txSpreadPct;
  // console.log('profitPPM', profitPpm, profitPct);

  if (profitPct && profitPct >= minSpreadPctForSwap) {
    // preflight
    const pre = await preflightExecuteSwaps(vault, stepsForRealTx, profitToken, false, true);

    if (!pre.ok) {
      console.error("❌ Preflight failed — TX NOT SENT");
      console.error(pre.decoded);
      // return { ok: false, stage: "preflight", error: pre.decoded };
    } else {
      const gasLimit = (pre.gas * 12n) / 10n; // +20%
      console.log(`✅ Preflight OK. estimated=${pre!.gas} gasLimit=${gasLimit}`);
    }

    console.log(11111111111111 ,profitPct);

    // console.log('stepsForRealTx', stepsForRealTx);
    // console.log('simulationSpreadPct', simulationSpreadPct);
    try {
      const txTimeStart = new Date();

      // 1. Отправляем транзакцию (без await для замера времени до майнинга, если нужно)
      tx = await vault.executeSwaps(
        stepsForRealTx,
        profitToken,
        true,
        true,
        {
          gasLimit: 1_200_000n, // для 2 шагов V3 — норм
        }
      );
      // console.log("Транзакция отправлена:", tx.hash);

      // 2. Ждем подтверждения (майнинга)
      receipt = await tx.wait();

      const txTimeFinish = new Date();
      txLatency = txTimeFinish.getTime() - txTimeStart.getTime();

      // console.log(`Транзакция успешна! Latency: ${txLatency}ms`);

    } catch (error: any) {
      console.error("❌ Транзакция зафейлилась");

      const decoded = decodeRevert(error);

      if (decoded.type === "CUSTOM_ERROR") {
        console.error(`🔴 Custom error: ${decoded.name}`);

        if (decoded.args) {
          console.error("Args:", decoded.args);
        }

        // удобные хелперы под твой контракт
        if (decoded.name === "SLIPPAGE") {
          console.error("👉 Slippage: amountOut < amountOutMin");
        }

        if (decoded.name === "LOSS_EXCEEDS_LIMIT") {
          const [loss, maxAllowed] = decoded.args!;
          console.error(
            `👉 Loss ${loss} exceeds maxAllowed ${maxAllowed}`
          );
        }

        if (decoded.name === "ArbExecutionLoss") {
          const [summary, logs] = decoded.args!;
          console.error("👉 ArbExecutionLoss summary:", summary);
          console.error("👉 Swap logs:", logs);
        }
      } else {
        console.error("⚠️ Не удалось декодировать revert:", decoded);
      }
    }

    if (tx) {
      const dataByHash = await fetchAllFromArbiscanByTxHash(tx.hash);
      console.log(dataByHash);
    }

  }

  const result = {
    simulationBlockExecuted: Number(simulationSummary[0]),
    simulationSpreadPct,
    simulationLatency,
    simulationGas: Number(simulationSummary[6]),
    simulationStepsLogs,

    txBlockL1: Number(receipt?.blockNumber),
    txLatency,
    txHash: tx?.hash,
    txGas: Number(receipt?.gasUsed),
  };

  return result;
}
