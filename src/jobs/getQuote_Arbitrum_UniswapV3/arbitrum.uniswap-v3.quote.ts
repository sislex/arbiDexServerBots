// arbitrum.uniswap-v3.quote.ts
import {IJobParams_get_Arbitrum_UniswapV3_Quote} from '../../store/state.types';

import { ethers } from "ethers";
import {QuoteResult} from '../handlers';

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

/**
 * Полностью рабочая реальная торговая квота Uniswap V3.
 * Если poolAddress не передан — находим через Factory.
 */

export async function get_Arbitrum_UniswapV3_Quote(params: IJobParams_get_Arbitrum_UniswapV3_Quote): Promise<QuoteResult> {
  const {
    poolAddress,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    feePpm,
    rpcUrl = "https://arb1.arbitrum.io/rpc"
  } = params;

  const tokenInAddr  = ethers.getAddress(tokenIn.address);
  const tokenOutAddr = ethers.getAddress(tokenOut.address);

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // -----------------------------
  // 1. Получаем пул, если не передан
  // -----------------------------
  let pool = poolAddress;

  if (!pool) {
    const factory = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, provider);

    try {
      pool = await factory.getPool(tokenInAddr, tokenOutAddr, feePpm);
      // console.log('after getPool', pool);
    } catch (err: any) {
      console.error('getPool error:', err);
      return {
        ok: false,
        error: "FACTORY_CALL_FAILED",
        message: err?.message ?? String(err),
      };
    }

    if (pool === ethers.ZeroAddress) {
      return {
        ok: false,
        error: "POOL_NOT_FOUND",
        message: "Uniswap V3 pool does not exist for this pair & fee tier",
      };
    }
  }

  // -----------------------------
  // 2. Используем Quoter для точной квоты
  // -----------------------------

  const quoter = new ethers.Contract(UNISWAP_V3_QUOTER_V2, QUOTER_V2_ABI, provider);

  const qParamsIn = {
    tokenIn: tokenInAddr,
    tokenOut: tokenOutAddr,
    amountIn,
    fee: feePpm,
    sqrtPriceLimitX96: 0n
  };

  const qParamsOut = amountOut !== undefined ? {
    tokenIn: tokenOutAddr,
    tokenOut: tokenInAddr,
    amountOut, // сколько хотим получить исходного tokenIn (exact-out в обратном направлении)
    fee: feePpm,
    sqrtPriceLimitX96: 0n
  } : undefined;

  // const result: QuoteResult = await quoteV3Parallel(quoter, qParamsIn, qParamsOut);
  const result: QuoteResult = await quoteV3Multicall(provider, quoter, qParamsIn, qParamsOut);

  // const blockNumber = await provider.getBlockNumber();

  return result;
}

async function quoteV3Parallel(quoter, qParamsIn, qParamsOut?: any): Promise<QuoteResult> {
  const startTime = Date.now();
  try {
    const promises: Promise<any>[] = [
      quoter.getFunction("quoteExactInputSingle").staticCall(qParamsIn)
    ];

    if (qParamsOut) {
      promises.push(
        quoter.getFunction("quoteExactOutputSingle").staticCall(qParamsOut)
      );
    }

    const result = await Promise.all(promises);

    const latencyMs = Date.now() - startTime;

    const exactInDecoded = result[0];
    const exactOutDecoded = qParamsOut ? result[1] : undefined;

    return {
      ok: true,
      latencyMs,
      result: {
        quoteExactInputSingle: mapExactIn(exactInDecoded),
        quoteExactOutputSingle: exactOutDecoded ? mapExactOut(exactOutDecoded) : undefined,
      }
    };

  } catch (e: any) {
    const latencyMs = Date.now() - startTime;

    return {
      ok: false,
      latencyMs,
      error: "QUOTER_REVERT",
      message: e?.shortMessage || e?.message || String(e),
    };
  }
}

async function quoteV3Multicall(
  provider: ethers.JsonRpcProvider,
  quoter: ethers.Contract,
  qParamsIn: any,
  qParamsOut?: any
): Promise<QuoteResult> {
  const startTime = Date.now();

  try {
    const multicall = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);

    // формируем список вызовов
    const calls: Array<{ target: string; callData: string }> = [
      {
        target: UNISWAP_V3_QUOTER_V2,
        callData: quoter.interface.encodeFunctionData(
          "quoteExactInputSingle",
          [qParamsIn]
        ),
      },
    ];

    if (qParamsOut) {
      calls.push({
        target: UNISWAP_V3_QUOTER_V2,
        callData: quoter.interface.encodeFunctionData(
          "quoteExactOutputSingle",
          [qParamsOut]
        ),
      });
    }

    // один eth_call на multicall.aggregate
    const [blockNumber, returnData]: [bigint, string[]] = await multicall.getFunction("aggregate").staticCall(calls);

    // decode exact-in
    const exactInDecoded = quoter.interface.decodeFunctionResult(
      "quoteExactInputSingle",
      returnData[0]
    );

    // decode exact-out (если был)
    const exactOutDecoded = qParamsOut
      ? quoter.interface.decodeFunctionResult(
        "quoteExactOutputSingle",
        returnData[1]
      )
      : undefined;

    const latencyMs = Date.now() - startTime;

    return {
      ok: true,
      latencyMs,
      result: {
        quoteExactInputSingle: mapExactIn(exactInDecoded),
        quoteExactOutputSingle: exactOutDecoded
          ? mapExactOut(exactOutDecoded)
          : undefined,
      },
      // если потом захочешь использовать blockNumber — можешь добавить поле в интерфейс
      blockNumber: Number(blockNumber),
    };
  } catch (e: any) {
    const latencyMs = Date.now() - startTime;

    return {
      ok: false,
      latencyMs,
      error: "MULTICALL_OR_QUOTER_REVERT",
      message: e?.shortMessage || e?.message || String(e),
    };
  }
}
