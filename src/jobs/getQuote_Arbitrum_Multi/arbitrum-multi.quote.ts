// arbitrum-multi.quote.ts
import {
  DexId,
  IJobParams_get_Arbitrum_Quote_Multi, IQuote
} from '../../store/state.types';

import { ethers } from "ethers";
import {QuoteResultMulti} from '../handlers';
import {toBigIntSafe} from '../../helpers/toBigIntSafe';
import {
  MULTICALL3, MULTICALL_ABI, V2_DEXES, V3_QUOTERS
} from '../../helpers/dex.constants';

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

// один результат по одной паре
export interface IPairQuoteResult {
  pair: IQuote;
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

  poolIdIndex?: number;      // <-- NEW (one call quoteBothBase)

  v2ExactInIndex?: number;
  v2ExactOutIndex?: number;
}

export async function get_Arbitrum_Quote_Multi(
  params: IJobParams_get_Arbitrum_Quote_Multi
): Promise<QuoteResultMulti> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;

  const provider  = new ethers.JsonRpcProvider(rpcUrl);
  const v2Routers: Partial<Record<DexId, ethers.Contract>> = {};
  const v3Quoters: Partial<Record<DexId, ethers.Contract>> = {};
  let poolIdQuoter: ethers.Contract | null = null;

  function getV2Router(dex: DexId) {
    return v2Routers[dex] ??= new ethers.Contract(V2_DEXES[dex].router, V2_DEXES[dex].abi, provider);
  }

  function getV3Quoter(dex: DexId) {
    return v3Quoters[dex] ??= new ethers.Contract(V3_QUOTERS[dex].quoter, V3_QUOTERS[dex].abi, provider);
  }

  function getPoolIdQuoter() {
    return poolIdQuoter ??= new ethers.Contract(V3_QUOTERS.poolId.quoter, V3_QUOTERS.poolId.abi, provider);
  }

  const multicall = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);

  const startedAt = Date.now();

  // результат по всем парам (по индексу соответствует pairsToQuote)
  const pairResults: IPairQuoteResult[] = pairsToQuote.map(pair => ({ pair }));
  const decodePlan: IDecodePlan[] = pairsToQuote.map(() => ({}));

  // ---------- Готовим ОДИН большой multicall к Quoter’у ----------
  const calls: Array<{ target: string; callData: string }> = [];

  // ---------- 1. Собираем вызовы (и V2, и V3) ----------
  pairsToQuote.forEach((pair, i) => {
    const tokenInAddr  = ethers.getAddress(pair.tokenIn.address);
    const tokenOutAddr = ethers.getAddress(pair.tokenOut.address);

    const amountIn  = toBigIntSafe(pair.amount);

    if (amountIn === undefined) {
      pairResults[i].error   = "AMOUNT_IN_REQUIRED";
      pairResults[i].message = "amountIn must be provided for exact-input quoting";
      return;
    }

    if (pair.quoteSource === 'uniswap-v2-router') {
      if (pair.version === 'v2') {
        const dexCfg = V2_DEXES[pair.dex];
        console.log(dexCfg);
        if (!dexCfg) {
          pairResults[i].error = "DEX_NOT_CONFIGURED";
          pairResults[i].message = `No V2 config for dex=${pair.dex}`;
          return;
        }

        const v2Router = getV2Router(pair.dex);

        const pathInOut = (pair.path?.length ?? 0) > 1
          ? pair.path!.map(t => ethers.getAddress(t.address))
          : [tokenInAddr, tokenOutAddr];

        const v2ExactInIndex = calls.length;
        calls.push({
          target: dexCfg.router,
          callData: v2Router.interface.encodeFunctionData("getAmountsOut", [amountIn, pathInOut]),
        });
        decodePlan[i].v2ExactInIndex = v2ExactInIndex;

        const pathOutIn = [...pathInOut].reverse();
        const v2ExactOutIndex = calls.length;
        calls.push({
          target: dexCfg.router,
          callData: v2Router.interface.encodeFunctionData("getAmountsIn", [amountIn, pathOutIn]),
        });
        decodePlan[i].v2ExactOutIndex = v2ExactOutIndex;

        return;
      }
    } else  if (pair.quoteSource === 'quoteBothBase') {
      if (pair.poolAddress) {
        const q = getPoolIdQuoter();

        // poolId = адрес пула (pool address)
        const pool = ethers.getAddress(pair.poolAddress);

        const poolIdIndex = calls.length;
        calls.push({
          target: V3_QUOTERS.poolId.quoter,
          callData: q.interface.encodeFunctionData("quoteBothBase", [{
            pool,
            baseToken: tokenInAddr,
            quoteToken: tokenOutAddr,
            amountBase: amountIn,      // вход всегда amountIn (base)
            sqrtPriceLimitX96: 0n,
          }]),
        });

        decodePlan[i].poolIdIndex = poolIdIndex;
        return;
      }
    } else  if (pair.quoteSource === 'uniswap-v3-quoter-v2') {
      const dexCfg = V3_QUOTERS[pair.dex];
      if (!dexCfg) {
        pairResults[i].error = "DEX_NOT_CONFIGURED";
        pairResults[i].message = `No V3 quoter config for dex=${pair.dex}`;
        return;
      }

      if (pair.feePpm === undefined) {
        pairResults[i].error = "FEE_PPM_REQUIRED";
        pairResults[i].message = "feePpm must be provided for v3 pools";
        return;
      }

      const quoterV3 = getV3Quoter(pair.dex);

      const qParamsIn = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        amountIn,
        fee: pair.feePpm,
        sqrtPriceLimitX96: 0n,
      };

      const qParamsOut = {
        tokenIn: tokenOutAddr,
        tokenOut: tokenInAddr,
        amountOut: amountIn,
        fee: pair.feePpm,
        sqrtPriceLimitX96: 0n,
      };

      const exactInIndex = calls.length;
      calls.push({
        target: dexCfg.quoter,
        callData: quoterV3.interface.encodeFunctionData("quoteExactInputSingle", [qParamsIn]),
      });
      decodePlan[i].exactInIndex = exactInIndex;

      const exactOutIndex = calls.length;
      calls.push({
        target: dexCfg.quoter,
        callData: quoterV3.interface.encodeFunctionData("quoteExactOutputSingle", [qParamsOut]),
      });
      decodePlan[i].exactOutIndex = exactOutIndex;
    } else if (pair.quoteSource === 'camelot-v3-quoter') {
      const quoter = getV3Quoter('camelot');

      const qParamsIn = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        amountIn,
        limitSqrtPrice: 0n,
      };

      const exactInIndex = calls.length;
      calls.push({
        target: V3_QUOTERS.camelot.quoter,
        callData: quoter.interface.encodeFunctionData(
          "quoteExactInputSingle",
          [qParamsIn]
        ),
      });
      decodePlan[i].exactInIndex = exactInIndex;
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

  // console.log('calls to multicall:', calls);

  // ---------- 2. Один multicall.aggregate ----------
  try {
    const [blockNumber, returnData]: [bigint, string[]] =
      await multicall.getFunction("aggregate").staticCall(calls);

    // ---------- 3. Декодируем по плану ----------
    for (let i = 0; i < pairsToQuote.length; i++) {
      if (pairResults[i].error) continue;

      const plan = decodePlan[i];
      const pair = pairsToQuote[i];

      if (pair.quoteSource === 'uniswap-v2-router') {
        const v2Router = getV2Router(pair.dex);

        // --- V2 decode ---
        let v2AmountOutExactIn: string | undefined;
        let v2AmountInExactOut: string | undefined;

        if (plan.v2ExactInIndex !== undefined) {
          try {
            const decoded = v2Router.interface.decodeFunctionResult("getAmountsOut", returnData[plan.v2ExactInIndex]);
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
            const decoded = v2Router.interface.decodeFunctionResult("getAmountsIn", returnData[plan.v2ExactOutIndex]);
            const amounts = decoded[0] as bigint[];
            if (amounts && amounts.length > 0) {
              v2AmountInExactOut = amounts[0].toString();
            }
          } catch(e: any) {
            console.log('Error decoding V2 getAmountsOut:', e);
          }
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

      } else if (pair.quoteSource === 'quoteBothBase') {
        const q = getPoolIdQuoter();

        if (plan.poolIdIndex === undefined) {
          pairResults[i].error = "NO_CALL_PLANNED";
          pairResults[i].message = "poolIdIndex missing in decodePlan";
          continue;
        }

        const decoded = q.interface.decodeFunctionResult(
          "quoteBothBase",
          returnData[plan.poolIdIndex]
        );

        // decoded[0] = QuoteBothResponse tuple
        const resp = decoded[0];

        // сохраним poolAddress
        pairResults[i].poolAddress = (resp.pool as string);

        // Мапим в твою старую структуру "как будто UniswapQuoterV2"
        pairResults[i].quote = {
          quoteExactInputSingle: {
            amountOut: (resp.exactIn.amountOut as bigint).toString(),
            sqrtPriceX96After: (resp.exactIn.sqrtPriceX96After as bigint).toString(),
            initializedTicksCrossed: (resp.exactIn.initializedTicksCrossed as bigint).toString(),
            gasEstimate: (resp.exactIn.gasEstimate as bigint).toString(),
          },
          quoteExactOutputSingle: {
            amountIn: (resp.exactOut.amountIn as bigint).toString(),
            sqrtPriceX96After: (resp.exactOut.sqrtPriceX96After as bigint).toString(),
            initializedTicksCrossed: (resp.exactOut.initializedTicksCrossed as bigint).toString(),
            gasEstimate: (resp.exactOut.gasEstimate as bigint).toString(),
          },
        };
      } else if (pair.quoteSource === 'uniswap-v3-quoter-v2') {
        const quoterV3 = getV3Quoter(pair.dex);

        let quoteExactInputSingle: QuoteExactInputSingleRaw | undefined;
        let quoteExactOutputSingle: QuoteExactOutputSingleRaw | undefined;

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
      } else if (pair.quoteSource === 'camelot-v3-quoter') {

        console.log(123);
        const quoter = getV3Quoter('camelot');

        // exact in
        if (plan.exactInIndex === undefined) {
          pairResults[i].error = "NO_CALL_PLANNED";
          pairResults[i].message = "exactInIndex missing in decodePlan for camelot-v3-quoter";
          continue;
        }

        try {
          const decodedIn = quoter.interface.decodeFunctionResult(
            "quoteExactInputSingle",
            returnData[plan.exactInIndex]
          );

          // Algebra Quoter returns:
          // (amountOut, sqrtPriceX96After, tickAfter, gasEstimate)
          const amountOut = decodedIn[0] as bigint;
          const sqrtPriceX96After = decodedIn[1] as bigint;
          const tickAfter = decodedIn[2]; // может быть number | bigint в зависимости от ABI/ethers
          const gasEstimate = decodedIn[3] as bigint;

          pairResults[i].quote = {
            quoteExactInputSingle: {
              amountOut: amountOut.toString(),
              sqrtPriceX96After: sqrtPriceX96After.toString(),
              // маппим tickAfter в initializedTicksCrossed (для совместимости)
              initializedTicksCrossed: tickAfter.toString(),
              gasEstimate: gasEstimate.toString(),
            },
            // exactOut пока не вызываем — поэтому undefined
            quoteExactOutputSingle: undefined,
          };
        } catch (e: any) {
          pairResults[i].error = "CAMELOT_V3_DECODE_FAILED";
          pairResults[i].message = e?.shortMessage || e?.message || String(e);
        }
      }
    }

    const latencyMs = Date.now() - startedAt;

    return {
      ok: true,
      latencyMs,
      result: pairResults,
      blockNumber: Number(blockNumber),
    };
  } catch (e: any) {
    console.log('error in multicall aggregate:', e);
    const latencyMs = Date.now() - startedAt;

    return {
      ok: false,
      latencyMs,
      error: "MULTICALL_OR_QUOTER_REVERT",
      message: e?.shortMessage || e?.message || String(e),
    };
  }
}

