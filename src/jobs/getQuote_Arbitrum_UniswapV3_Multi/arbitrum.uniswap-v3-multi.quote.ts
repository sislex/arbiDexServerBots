// arbitrum.uniswap-v3-multi.quote.ts
import {
  IJobParams_get_Arbitrum_UniswapV3_Quote_Multi, IPairToQuote
} from '../../store/state.types';

import { ethers } from "ethers";
import {QuoteResultMulti} from '../handlers';

export interface QuoteExactInputSingleRaw {
  amountOut: string;
  sqrtPriceX96After: string;
  initializedTicksCrossed: string;
  gasEstimate: string;
}

export interface QuoteExactOutputSingleRaw {
  amountIn: string;
  sqrtPriceX96After: string;
  initializedTicksCrossed: string;
  gasEstimate: string;
}

const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const UNISWAP_V3_QUOTER_V2 = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

const QUOTER_V2_ABI = [
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amountOut, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
];

// Multicall3 (Arbitrum One)
const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";
const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
];

// helpers: Result(4) -> JSON-safe object
const mapExactIn = (raw: any): QuoteExactInputSingleRaw => ({
  amountOut: raw[0].toString(),
  sqrtPriceX96After: raw[1].toString(),
  initializedTicksCrossed: raw[2].toString(),
  gasEstimate: raw[3].toString(),
});

const mapExactOut = (raw: any): QuoteExactOutputSingleRaw => ({
  amountIn: raw[0].toString(),
  sqrtPriceX96After: raw[1].toString(),
  initializedTicksCrossed: raw[2].toString(),
  gasEstimate: raw[3].toString(),
});

// --- helper для bigint | string
const toBigIntSafe = (v: bigint | string | undefined): bigint | undefined => {
  if (v === undefined) return undefined;
  return typeof v === 'bigint' ? v : BigInt(v);
};

// один результат по одной паре
export interface IPairQuoteResult {
  pair: IPairToQuote;
  poolAddress?: string;
  quote?: {
    quoteExactInputSingle: QuoteExactInputSingleRaw;
    quoteExactOutputSingle?: QuoteExactOutputSingleRaw;
  };
  error?: string;
  message?: string;
}

// план декодирования: в каких индексах returnData лежат ответы по паре
interface IDecodePlan {
  exactInIndex?: number;
  exactOutIndex?: number;
}

export async function get_Arbitrum_UniswapV3_Quote_Multi(
  params: IJobParams_get_Arbitrum_UniswapV3_Quote_Multi
): Promise<QuoteResultMulti> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;

  const provider  = new ethers.JsonRpcProvider(rpcUrl);
  const factory   = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, provider);
  const quoter    = new ethers.Contract(UNISWAP_V3_QUOTER_V2, QUOTER_V2_ABI, provider);
  const multicall = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);

  const startedAt = Date.now();

  // результат по всем парам (по индексу соответствует pairsToQuote)
  const pairResults: IPairQuoteResult[] = pairsToQuote.map(pair => ({ pair }));
  const decodePlan: IDecodePlan[] = pairsToQuote.map(() => ({}));

  // // ---------- 1. Получаем пулы (параллельно, но НЕ через multicall) ----------
  // const poolAddresses = await Promise.all(
  //   pairsToQuote.map(async (pair, i) => {
  //     const tokenInAddr  = ethers.getAddress(pair.tokenIn.address);
  //     const tokenOutAddr = ethers.getAddress(pair.tokenOut.address);
  //
  //     try {
  //       const pool = await factory.getPool(tokenInAddr, tokenOutAddr, pair.feePpm);
  //       pairResults[i].poolAddress = pool;
  //       return pool;
  //     } catch (err: any) {
  //       pairResults[i].error   = "FACTORY_CALL_FAILED";
  //       pairResults[i].message = err?.message ?? String(err);
  //       return ethers.ZeroAddress; // чтобы ниже мы эту пару просто пропустили
  //     }
  //   })
  // );

  // ---------- 2. Готовим ОДИН большой multicall к Quoter’у ----------
  const calls: Array<{ target: string; callData: string }> = [];

  pairsToQuote.forEach((pair, i) => {
    // const pool = poolAddresses[i];
    //
    // // если уже есть ошибка или пул не найден — эту пару не квотируем
    // if (pool === ethers.ZeroAddress || pairResults[i].error) {
    //   if (!pairResults[i].error) {
    //     pairResults[i].error   = "POOL_NOT_FOUND";
    //     pairResults[i].message = "Uniswap V3 pool does not exist for this pair & fee tier";
    //   }
    //   return;
    // }

    const tokenInAddr  = ethers.getAddress(pair.tokenIn.address);
    const tokenOutAddr = ethers.getAddress(pair.tokenOut.address);

    const amountIn  = toBigIntSafe(pair.amountIn);
    const amountOut = toBigIntSafe(pair.amountOut);

    if (amountIn === undefined) {
      pairResults[i].error   = "AMOUNT_IN_REQUIRED";
      pairResults[i].message = "amountIn must be provided for exact-input quoting";
      return;
    }

    const qParamsIn = {
      tokenIn: tokenInAddr,
      tokenOut: tokenOutAddr,
      amountIn,
      fee: pair.feePpm,
      sqrtPriceLimitX96: 0n,
    };

    const qParamsOut = amountOut !== undefined ? {
      tokenIn: tokenOutAddr,   // обратное направление
      tokenOut: tokenInAddr,
      amountOut,
      fee: pair.feePpm,
      sqrtPriceLimitX96: 0n,
    } : undefined;

    // exact-in
    const exactInIndex = calls.length;
    calls.push({
      target: UNISWAP_V3_QUOTER_V2,
      callData: quoter.interface.encodeFunctionData(
        "quoteExactInputSingle",
        [qParamsIn]
      ),
    });
    decodePlan[i].exactInIndex = exactInIndex;

    // опционально exact-out
    if (qParamsOut) {
      const exactOutIndex = calls.length;
      calls.push({
        target: UNISWAP_V3_QUOTER_V2,
        callData: quoter.interface.encodeFunctionData(
          "quoteExactOutputSingle",
          [qParamsOut]
        ),
      });
      decodePlan[i].exactOutIndex = exactOutIndex;
    }
  });

  // если не осталось ни одного вызова к quoter’у — просто возвращаем то, что собрали
  if (calls.length === 0) {
    const latencyMs = Date.now() - startedAt;
    return {
      ok: true,
      latencyMs,
      result: pairResults,
    };
  }

  // ---------- 3. Один большой multicall.aggregate ----------
  try {
    const [blockNumber, returnData]: [bigint, string[]] =
      await multicall.getFunction("aggregate").staticCall(calls);

    // ---------- 4. Декодируем ответы по плану ----------
    for (let i = 0; i < pairsToQuote.length; i++) {
      // если по паре уже была ошибка — пропускаем
      if (pairResults[i].error) continue;

      const plan = decodePlan[i];

      let quoteExactInputSingle: QuoteExactInputSingleRaw | undefined;
      let quoteExactOutputSingle: QuoteExactOutputSingleRaw | undefined;

      if (plan.exactInIndex !== undefined) {
        const decodedIn = quoter.interface.decodeFunctionResult(
          "quoteExactInputSingle",
          returnData[plan.exactInIndex]
        );
        quoteExactInputSingle = mapExactIn(decodedIn);
      }

      if (plan.exactOutIndex !== undefined) {
        const decodedOut = quoter.interface.decodeFunctionResult(
          "quoteExactOutputSingle",
          returnData[plan.exactOutIndex]
        );
        quoteExactOutputSingle = mapExactOut(decodedOut);
      }

      if (!quoteExactInputSingle) {
        pairResults[i].error   = "NO_QUOTE_IN_RESULT";
        pairResults[i].message = "Multicall result missing quoteExactInputSingle for this pair";
        continue;
      }

      pairResults[i].quote = {
        quoteExactInputSingle,
        quoteExactOutputSingle,
      };
    }

    const latencyMs = Date.now() - startedAt;

    return {
      ok: true,
      latencyMs,
      result: pairResults,
      blockNumber: Number(blockNumber),
    };
  } catch (e: any) {
    const latencyMs = Date.now() - startedAt;

    return {
      ok: false,
      latencyMs,
      error: "MULTICALL_OR_QUOTER_REVERT",
      message: e?.shortMessage || e?.message || String(e),
    };
  }
}

