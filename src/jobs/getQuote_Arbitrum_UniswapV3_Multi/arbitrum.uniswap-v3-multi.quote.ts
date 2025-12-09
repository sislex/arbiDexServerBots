// arbitrum.uniswap-v3-multi.quote.ts
import {
  IJobParams_get_Arbitrum_UniswapV3_Quote_Multi, IPairToQuote, IUniV3PairToQuote
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

// Uniswap V3
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const UNISWAP_V3_QUOTER_V2 = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

const QUOTER_V2_ABI = [
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amountOut, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
];

// Uniswap V2 router (Arbitrum One)
const UNISWAP_V2_ROUTER = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";

const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
  "function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts)"
];
const UNISWAP_V2_FACTORY = "0xf1D7CC64Fb4452F05c498126312eBE29F30Bfcf9";

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

  v2ExactInIndex?: number;   // getAmountsOut
  v2ExactOutIndex?: number;  // getAmountsIn
}

export async function get_Arbitrum_Quote_Multi(
  params: IJobParams_get_Arbitrum_UniswapV3_Quote_Multi
): Promise<QuoteResultMulti> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;

  const provider  = new ethers.JsonRpcProvider(rpcUrl);
  const quoterV3    = new ethers.Contract(UNISWAP_V3_QUOTER_V2, QUOTER_V2_ABI, provider);
  const v2Router    = new ethers.Contract(UNISWAP_V2_ROUTER, UNISWAP_V2_ROUTER_ABI, provider);
  const multicall = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);

  const startedAt = Date.now();

  // результат по всем парам (по индексу соответствует pairsToQuote)
  const pairResults: IPairQuoteResult[] = pairsToQuote.map(pair => ({ pair }));
  const decodePlan: IDecodePlan[] = pairsToQuote.map(() => ({}));

  // ----------  Готовим ОДИН большой multicall к Quoter’у ----------
  const calls: Array<{ target: string; callData: string }> = [];

  // ---------- 1. Собираем вызовы (и V2, и V3) ----------
  pairsToQuote.forEach((pair, i) => {
    const tokenInAddr  = ethers.getAddress(pair.tokenIn.address);
    const tokenOutAddr = ethers.getAddress(pair.tokenOut.address);

    const amountIn  = toBigIntSafe(pair.amountIn);
    const amountOut = toBigIntSafe(pair.amountOut);

    if (amountIn === undefined) {
      pairResults[i].error   = "AMOUNT_IN_REQUIRED";
      pairResults[i].message = "amountIn must be provided for exact-input quoting";
      return;
    }

    // --- ветка UNISWAP V2 ---
    if (pair.dex === 'uniswap' && pair.version === 'v2') {
      const pathInOut = (pair.path?.length ?? 0) > 1
        ? pair.path!.map(t => ethers.getAddress(t.address))
        : [tokenInAddr, tokenOutAddr];

      // exact-in: getAmountsOut(amountIn, path)
      const v2ExactInIndex = calls.length;
      calls.push({
        target: UNISWAP_V2_ROUTER,
        callData: v2Router.interface.encodeFunctionData(
          "getAmountsOut",
          [amountIn, pathInOut]
        )
      });
      decodePlan[i].v2ExactInIndex = v2ExactInIndex;

      // exact-out (если задан amountOut): getAmountsIn(amountOut, reversedPath)
      if (amountOut !== undefined) {
        const pathOutIn = [...pathInOut].reverse();
        const v2ExactOutIndex = calls.length;
        calls.push({
          target: UNISWAP_V2_ROUTER,
          callData: v2Router.interface.encodeFunctionData(
            "getAmountsIn",
            [amountOut, pathOutIn]
          )
        });
        decodePlan[i].v2ExactOutIndex = v2ExactOutIndex;
      }

      return; // V2 обработали, дальше для этой пары не идём
    }

    // --- ветка UNISWAP V3 ---
    if (pair.dex === 'uniswap' && pair.version === 'v3') {
      if (pair.feePpm === undefined) {
        pairResults[i].error   = "FEE_PPM_REQUIRED";
        pairResults[i].message = "feePpm must be provided for v3 pools";
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
        tokenIn: tokenOutAddr,
        tokenOut: tokenInAddr,
        amountOut,
        fee: pair.feePpm,
        sqrtPriceLimitX96: 0n,
      } : undefined;

      const exactInIndex = calls.length;
      calls.push({
        target: UNISWAP_V3_QUOTER_V2,
        callData: quoterV3.interface.encodeFunctionData(
          "quoteExactInputSingle",
          [qParamsIn]
        ),
      });
      decodePlan[i].exactInIndex = exactInIndex;

      if (qParamsOut) {
        const exactOutIndex = calls.length;
        calls.push({
          target: UNISWAP_V3_QUOTER_V2,
          callData: quoterV3.interface.encodeFunctionData(
            "quoteExactOutputSingle",
            [qParamsOut]
          ),
        });
        decodePlan[i].exactOutIndex = exactOutIndex;
      }

      return;
    }

    // --- сюда же можно потом добавить sushi v2 / v3 ---
    // if (pair.dex === 'sushi' && pair.version === 'v2') { ... }
    // if (pair.dex === 'sushi' && pair.version === 'v3') { ... }
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

  // ---------- 2. Один multicall.aggregate ----------
  try {
    const [blockNumber, returnData]: [bigint, string[]] =
      await multicall.getFunction("aggregate").staticCall(calls);

    // ---------- 3. Декодируем по плану ----------
    for (let i = 0; i < pairsToQuote.length; i++) {
      if (pairResults[i].error) continue;

      const plan = decodePlan[i];
      const pair = pairsToQuote[i];

      let quoteExactInputSingle: QuoteExactInputSingleRaw | undefined;
      let quoteExactOutputSingle: QuoteExactOutputSingleRaw | undefined;

      // --- UNISWAP V3 decode ---
      if (pair.dex === 'uniswap' && pair.version === 'v3') {
        if (plan.exactInIndex !== undefined) {
          const decodedIn = quoterV3.interface.decodeFunctionResult(
            "quoteExactInputSingle",
            returnData[plan.exactInIndex]
          );
          quoteExactInputSingle = mapExactIn(decodedIn);
        }

        if (plan.exactOutIndex !== undefined) {
          const decodedOut = quoterV3.interface.decodeFunctionResult(
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

        continue;
      }

      // --- UNISWAP V2 decode ---
      if (pair.dex === 'uniswap' && pair.version === 'v2') {



        let v2AmountOutExactIn: string | undefined;
        let v2AmountInExactOut: string | undefined;

        if (plan.v2ExactInIndex !== undefined) {
          try {
            const decoded = v2Router.interface.decodeFunctionResult(
              "getAmountsOut",
              returnData[plan.v2ExactInIndex]
            );


            const amounts = decoded[0] as bigint[];
            if (amounts && amounts.length > 0) {
              v2AmountOutExactIn = amounts[amounts.length - 1].toString();
            }

          } catch(e: any) {
            console.log('Error decoding V2 getAmountsOut:', e);
          }
        }

        if (plan.v2ExactOutIndex !== undefined) {
          try {
            const decoded = v2Router.interface.decodeFunctionResult(
              "getAmountsIn",
              returnData[plan.v2ExactOutIndex]
            );
            const amounts = decoded[0] as bigint[];
            if (amounts && amounts.length > 0) {
              v2AmountInExactOut = amounts[0].toString();
            }
          } catch {/* ignore */}
        }

        // чтобы bestSellBuyArbitrage мог с этим работать,
        // можно адаптировать структуру под "как будто V3":
        if (v2AmountOutExactIn) {
          pairResults[i].quote = {
            quoteExactInputSingle: {
              amountOut: v2AmountOutExactIn,
              sqrtPriceX96After: "0",
              initializedTicksCrossed: "0",
              gasEstimate: "0",
            },
            quoteExactOutputSingle: v2AmountInExactOut
              ? {
                amountIn: v2AmountInExactOut,
                sqrtPriceX96After: "0",
                initializedTicksCrossed: "0",
                gasEstimate: "0",
              }
              : undefined,
          };
        }

        continue;
      }

      // сюда же потом добавишь sushi v2 / v3
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

