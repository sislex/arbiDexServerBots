// arbitrum-multi.quote.ts
import {
  DexId,
  IJobParams_get_Arbitrum_Quote_Multi, IPairToQuote
} from '../../store/state.types';

import { ethers } from "ethers";
import {QuoteResultMulti} from '../handlers';
import {toBigIntSafe} from '../../halpers/toBigIntSafe';
import {
  MULTICALL3, MULTICALL_ABI, V2_DEXES, V3_QUOTERS
} from '../../halpers/dex.constants';

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
  params: IJobParams_get_Arbitrum_Quote_Multi
): Promise<QuoteResultMulti> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;

  const provider  = new ethers.JsonRpcProvider(rpcUrl);
  const v2Routers: Partial<Record<DexId, ethers.Contract>> = {};
  const v3Quoters: Partial<Record<DexId, ethers.Contract>> = {};
  function getV2Router(dex: DexId) {
    return v2Routers[dex] ??= new ethers.Contract(V2_DEXES[dex].router, V2_DEXES[dex].abi, provider);
  }
  function getV3Quoter(dex: DexId) {
    return v3Quoters[dex] ??= new ethers.Contract(V3_QUOTERS[dex].quoter, V3_QUOTERS[dex].abi, provider);
  }

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
    if (pair.version === 'v2') {
      const dexCfg = V2_DEXES[pair.dex];
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

      if (amountOut !== undefined) {
        const pathOutIn = [...pathInOut].reverse();
        const v2ExactOutIndex = calls.length;
        calls.push({
          target: dexCfg.router,
          callData: v2Router.interface.encodeFunctionData("getAmountsIn", [amountOut, pathOutIn]),
        });
        decodePlan[i].v2ExactOutIndex = v2ExactOutIndex;
      }

      return;
    } else if (pair.version === 'v3') {
      if (pair.poolId) {
        // poolId quoting: через твой контракт
        const poolIdQuoter = getV3Quoter('poolId' as any); // или расширь тип DexId

        const exactInIndex = calls.length;
        calls.push({
          target: V3_QUOTERS.poolId.quoter,
          callData: poolIdQuoter.interface.encodeFunctionData(
            "quoteByPoolId",
            [{
              baseToken: tokenInAddr,
              quoteToken: tokenOutAddr,
              pool: ethers.getAddress(pair.poolId),
              amountBase: amountIn,
              sqrtPriceLimitX96: 0n, // твой контракт сам выставит no-limit
            }]
          ),
        });
        decodePlan[i].exactInIndex = exactInIndex;

        // ExactOut: чтобы “структура” была как раньше — вызываем второй раз,
        // но base=tokenOut, quote=tokenIn, amountBase=amountOut.
        if (amountOut !== undefined) {
          const exactOutIndex = calls.length;
          calls.push({
            target: V3_QUOTERS.poolId.quoter,
            callData: poolIdQuoter.interface.encodeFunctionData(
              "quoteByPoolId",
              [{
                baseToken: tokenOutAddr,
                quoteToken: tokenInAddr,
                pool: ethers.getAddress(pair.poolId),
                amountBase: amountOut,
                sqrtPriceLimitX96: 0n,
              }]
            ),
          });
          decodePlan[i].exactOutIndex = exactOutIndex;
        }

        return;
      } else {
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

        const qParamsOut = amountOut !== undefined ? {
          tokenIn: tokenOutAddr,
          tokenOut: tokenInAddr,
          amountOut,
          fee: pair.feePpm,
          sqrtPriceLimitX96: 0n,
        } : undefined;

        const exactInIndex = calls.length;
        calls.push({
          target: dexCfg.quoter,
          callData: quoterV3.interface.encodeFunctionData("quoteExactInputSingle", [qParamsIn]),
        });
        decodePlan[i].exactInIndex = exactInIndex;

        if (qParamsOut) {
          const exactOutIndex = calls.length;
          calls.push({
            target: dexCfg.quoter,
            callData: quoterV3.interface.encodeFunctionData("quoteExactOutputSingle", [qParamsOut]),
          });
          decodePlan[i].exactOutIndex = exactOutIndex;
        }
      }

      return;
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

  // ---------- 2. Один multicall.aggregate ----------
  try {
    const [blockNumber, returnData]: [bigint, string[]] =
      await multicall.getFunction("aggregate").staticCall(calls);

    // ---------- 3. Декодируем по плану ----------
    for (let i = 0; i < pairsToQuote.length; i++) {
      if (pairResults[i].error) continue;

      const plan = decodePlan[i];
      const pair = pairsToQuote[i];

      if (pair.version === 'v2') {
        const dexCfg = V2_DEXES[pair.dex];
        const v2Router = getV2Router(pair.dex);

        // --- UNISWAP V2 decode ---
        if (pair.dex === 'uniswap') {
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
      } else if (pair.version === 'v3') {
        if (pair.poolId) {
          const poolIdQuoter = getV3Quoter('poolId' as any);

          // decode exactIn (quoteByPoolId)
          let exactInOut: string | undefined;
          let exactOutIn: string | undefined;

          if (plan.exactInIndex !== undefined) {
            const decoded = poolIdQuoter.interface.decodeFunctionResult(
              "quoteByPoolId",
              returnData[plan.exactInIndex]
            );

            // decoded[0] — это tuple QuoteResponse
            const resp = decoded[0];
            // resp.amountOutQuote — сколько quoteToken получаем за amountBase
            exactInOut = (resp.amountOutQuote as bigint).toString();

            // полезное — можно сохранить poolAddress
            pairResults[i].poolAddress = resp.pool as string;
          }

          if (plan.exactOutIndex !== undefined) {
            const decoded = poolIdQuoter.interface.decodeFunctionResult(
              "quoteByPoolId",
              returnData[plan.exactOutIndex]
            );
            const resp = decoded[0];

            // Тут мы котировали base=tokenOut, quote=tokenIn.
            // resp.amountOutQuote = сколько tokenIn получим за amountBase(tokenOut)
            // Но нам нужно “amountIn” tokenOut, чтобы получить amountBase(tokenIn).
            // Для этого в твоём контракте есть amountInQuoteForBase.
            exactOutIn = (resp.amountInQuoteForBase as bigint).toString();
          }

          if (!exactInOut) {
            pairResults[i].error = "NO_QUOTE_IN_RESULT";
            pairResults[i].message = "Multicall result missing quoteByPoolId exactIn for this pair";
            continue;
          }

          // адаптируем под твою прежнюю структуру V3
          pairResults[i].quote = {
            quoteExactInputSingle: {
              amountOut: exactInOut,
              sqrtPriceX96After: "0",
              initializedTicksCrossed: "0",
              gasEstimate: "0",
            },
            quoteExactOutputSingle: exactOutIn
              ? {
                amountIn: exactOutIn,
                sqrtPriceX96After: "0",
                initializedTicksCrossed: "0",
                gasEstimate: "0",
              }
              : undefined,
          };

          continue;
        } else {
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
        }

        continue;
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
    const latencyMs = Date.now() - startedAt;

    return {
      ok: false,
      latencyMs,
      error: "MULTICALL_OR_QUOTER_REVERT",
      message: e?.shortMessage || e?.message || String(e),
    };
  }
}

