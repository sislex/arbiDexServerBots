import {ethers} from 'ethers';
import ArbExecutorAbi from "../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json";
import {calcProfitPctFromLogs} from '../../helpers/calcProfitPctFromLogs';

const VAULT = "0x103B73a9A1081218196131364ff7A5941123BF4f";
const RPC = "https://arb1.arbitrum.io/rpc";


export async function arbExecutor(steps: any[], profitToken: string, contractAddress = VAULT) {
  const timeStart = new Date();
  const provider = new ethers.JsonRpcProvider(RPC);

  const pk = process.env.PRIVATE_KEY!;
  const signer = new ethers.Wallet(pk, provider);

  const vault = new ethers.Contract(contractAddress, ArbExecutorAbi.abi, signer);

  // preview
  const [summary, logs] = await vault.executeSwaps.staticCall(steps, profitToken, false);

  const executedSpreadPct = calcProfitPctFromLogs(logs);

  // // real tx
  // const tx = await vault.executeSwaps(steps, profitToken, false);
  // console.log("tx:", tx.hash);
  // await tx.wait();
  // console.log("tx end:", tx.hash);

  const timeFinish = new Date();
  const latency = timeFinish.getTime() - timeStart.getTime();

  const stepsLogs = logs.map((log: ethers.Contract | null) => ({
    poolAddress: log![2],
    tokenIn: log![3],
    tokenOut: log![4],
    amountIn: Number(log![5]),
    amountOut: Number(log![6]),
    gas: Number(log![7]),
  }))

  const result = {
    blockExecuted: Number(summary[0]),
    executedSpreadPct,
    latency,
    gas: Number(summary[6]),
    stepsLogs,
  };

  return result;
}
