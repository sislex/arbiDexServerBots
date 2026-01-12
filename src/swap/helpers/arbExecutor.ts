import {ethers} from 'ethers';
import ArbExecutorAbi from "../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json";
import {calcProfitPctFromLogs} from '../../helpers/calcProfitPctFromLogs';
import {fetchAllFromArbiscanByTxHash} from '../../helpers/arbiscan.helpers';

const VAULT = "0x103B73a9A1081218196131364ff7A5941123BF4f";
const RPC = "https://arb1.arbitrum.io/rpc";


export async function arbExecutor(steps: any[], profitToken: string, contractAddress = VAULT) {
  const provider = new ethers.JsonRpcProvider(RPC);

  const pk = process.env.PRIVATE_KEY!;
  const signer = new ethers.Wallet(pk, provider);

  const vault = new ethers.Contract(contractAddress, ArbExecutorAbi.abi, signer);



  // preview
  let  simulationSummary, simulationLogs, simulationStepsLogs, simulationLatency, simulationSpreadPct;
  try {
    const simulationTimeStart = new Date();

    [simulationSummary, simulationLogs] = await vault.executeSwaps.staticCall(
      steps,
      profitToken,
      false
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



  // // real tx
  // const tx = await vault.executeSwaps(steps, profitToken, false);
  // console.log("tx:", tx.hash);
  // await tx.wait();
  // console.log("tx end:", tx.hash);


  // real tx
  let  tx, receipt, txSummary, txLogs, txStepsLogs, txLatency, txSpreadPct;
  try {
    const txTimeStart = new Date();

    // 1. Отправляем транзакцию (без await для замера времени до майнинга, если нужно)
    tx = await vault.executeSwaps(steps, profitToken, false);
    console.log("Транзакция отправлена:", tx.hash);

    // 2. Ждем подтверждения (майнинга)
    receipt = await tx.wait();

    const txTimeFinish = new Date();
    txLatency = txTimeFinish.getTime() - txTimeStart.getTime();

    console.log(`Транзакция успешна! Latency: ${txLatency}ms`);

  } catch (error: any) {
    const reason = error?.reason || error?.data?.message || error?.message;
    console.error("Транзакция зафейлилась на этапе отправки или майнинга!");
    console.error("Причина:", reason);

    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("Недостаточно нативного токена (ETH/BNB) для оплаты газа");
    }
  }

  const dataByHash = await fetchAllFromArbiscanByTxHash(tx.hash);
  console.log(dataByHash);

  const result = {
    simulationBlockExecuted: Number(simulationSummary[0]),
    simulationSpreadPct,
    simulationLatency,
    simulationGas: Number(simulationSummary[6]),
    simulationStepsLogs,

    txBlockL1: Number(receipt.blockNumber),
    txLatency,
    txHash: tx.hash,
    txGas: Number(receipt.gasUsed),
    dataByHash: dataByHash,
  };

  console.log('result.dataByHash.transfers', result.dataByHash.transfers);
  console.log('result.dataByHash.raw', result.dataByHash.raw);

  return result;
}
