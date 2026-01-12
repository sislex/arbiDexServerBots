import { ethers } from "ethers";

const RPC = "https://arb1.arbitrum.io/rpc";
const ARBISCAN_V2 = "https://api.etherscan.io/v2/api";
const ARBITRUM_CHAIN_ID = 42161;

const ERC20_TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const ERC20_IFACE = new ethers.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]);

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function arbiscanV2(params: Record<string, string>) {
  const url = new URL(ARBISCAN_V2);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Arbiscan HTTP ${res.status}`);
  const json = await res.json();

  // v2 часто возвращает { status, message, result } — но для proxy может быть просто result
  if (json.status === "0" && json.message && json.message !== "No transactions found") {
    throw new Error(`Arbiscan error: ${json.message}`);
  }
  return json;
}

/**
 * Ждём, пока Arbiscan начнёт отдавать receipt по txhash (индексация).
 */
async function waitArbiscanReceipt(txHash: string, apiKey: string, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const j = await arbiscanV2({
        chainid: String(ARBITRUM_CHAIN_ID),
        module: "proxy",
        action: "eth_getTransactionReceipt",
        txhash: txHash,
        apikey: apiKey,
      });

      // proxy-методы обычно: { jsonrpc, id, result }
      const receipt = j.result;
      if (receipt) return receipt;
    } catch (e) {
      // иногда Arbiscan может временно отдавать 0/empty до индексации — просто повторяем
    }
    await sleep(1000);
  }
  throw new Error("Arbiscan не отдал receipt вовремя (возможно, ещё не проиндексировал).");
}

function decodeErc20TransfersFromReceiptLogs(logs: any[]) {
  const transfers: Array<{
    token: string;
    from: string;
    to: string;
    value: bigint;
    logIndex: number;
  }> = [];

  for (const l of logs) {
    if (!l?.topics?.length) continue;
    if (l.topics[0].toLowerCase() !== ERC20_TRANSFER_TOPIC.toLowerCase()) continue;

    try {
      const parsed = ERC20_IFACE.parseLog({
        topics: l.topics,
        data: l.data,
      });

      transfers.push({
        token: l.address,
        from: parsed?.args.from,
        to: parsed?.args.to,
        value: parsed?.args.value as bigint,
        logIndex: Number(l.logIndex ?? 0),
      });
    } catch {
      // если вдруг это не ERC20 Transfer — пропустим
    }
  }

  transfers.sort((a, b) => a.logIndex - b.logIndex);
  return transfers;
}

async function getEthPriceUsd(apiKey: string) {
  // Обычно у Etherscan есть module=stats&action=ethprice (в v2 тоже работает),
  // если вдруг не сработает — можно брать цену через любой другой прайс-оракул.
  const j = await arbiscanV2({
    chainid: String(ARBITRUM_CHAIN_ID),
    module: "stats",
    action: "ethprice",
    apikey: apiKey,
  });

  // бывает { result: { ethusd: "3118.98", ... } }
  const ethusd = j?.result?.ethusd;
  return ethusd ? Number(ethusd) : null;
}

/**
 * Главная функция: отправил tx (hash) -> достал данные из Arbiscan (receipt + transfers + fee $)
 */
export async function fetchAllFromArbiscanByTxHash(txHash: string) {
  const apiKey = process.env.ARBISCAN_API_KEY!;
  if (!apiKey) throw new Error("Нужен ARBISCAN_API_KEY");

  // 1) receipt через Arbiscan (ждём индексацию)
  const r = await waitArbiscanReceipt(txHash, apiKey);

  // 2) tx данные (gasPrice, from/to, input и т.д.) — через Arbiscan proxy
  const t = await arbiscanV2({
    chainid: String(ARBITRUM_CHAIN_ID),
    module: "proxy",
    action: "eth_getTransactionByHash",
    txhash: txHash,
    apikey: apiKey,
  });

  const tx = t.result;

  // 3) ERC20 transfers (как на вкладке “ERC-20 Token Transfers”) — декодим из receipt.logs
  const transfers = decodeErc20TransfersFromReceiptLogs(r.logs ?? []);

  // 4) Fee в ETH и USD
  // receipt.gasUsed и tx.gasPrice в hex
  const gasUsed = BigInt(r.gasUsed);
  const gasPrice = BigInt(tx.gasPrice);
  const feeWei = gasUsed * gasPrice;
  const feeEth = Number(ethers.formatEther(feeWei));

  const ethUsd = await getEthPriceUsd(apiKey);
  const feeUsd = ethUsd != null ? feeEth * ethUsd : null;


  return {
    txHash,
    status: r.status,               // "0x1" / "0x0"
    blockNumber: Number(BigInt(r.blockNumber)), // это то, что Arbiscan показывает в Block на странице
    from: tx.from,
    to: tx.to,
    gasUsed: Number(gasUsed),
    gasPriceGwei: Number(ethers.formatUnits(gasPrice, "gwei")),
    feeEth,
    feeUsd,
    transfers, // token/from/to/value
    raw: { tx, receipt: r },
  };
}
