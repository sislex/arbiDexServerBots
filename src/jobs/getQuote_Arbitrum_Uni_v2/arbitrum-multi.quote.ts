// Забор котировок только с Uniswap V2 (без multicall, но параллельно)
import { ethers } from 'ethers';
import { IJobParams_get_Arbitrum_Quote_Multi } from '../../store/state.types';
import { QuoteResultMulti } from '../handlers';
import { IPairQuoteResult } from '../getQuote_Arbitrum_Multi/arbitrum-multi.quote';
import { toBigIntSafe } from '../../halpers/toBigIntSafe';
import {V2_DEXES} from '../../halpers/dex.constants';

export async function get_Arbitrum_UniswapV2_Quote_NoMulticall(
  params: IJobParams_get_Arbitrum_Quote_Multi
): Promise<QuoteResultMulti> {
  const {
    pairsToQuote,
    rpcUrl = "https://arb1.arbitrum.io/rpc",
  } = params;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const v2Router = new ethers.Contract(V2_DEXES.uniswap.router, V2_DEXES.uniswap.abi, provider);

  const startedAt = Date.now();

  // результат по всем парам
  const pairResults: IPairQuoteResult[] = pairsToQuote.map(pair => ({ pair }));

  // массив промисов — по одному на каждую пару
  const tasks: Promise<void>[] = pairsToQuote.map(async (pair, i) => {
    // Эта функция работает ТОЛЬКО с Uniswap V2
    if (!(pair.dex === 'uniswap' && pair.version === 'v2')) {
      pairResults[i].error   = "UNSUPPORTED_PAIR";
      pairResults[i].message = "get_Arbitrum_UniswapV2_Quote_NoMulticall обрабатывает только пары Uniswap v2";
      return;
    }

    const tokenInAddr  = ethers.getAddress(pair.tokenIn.address);
    const tokenOutAddr = ethers.getAddress(pair.tokenOut.address);

    const amountIn  = toBigIntSafe(pair.amountIn);
    const amountOut = toBigIntSafe(pair.amountOut);

    if (amountIn === undefined) {
      pairResults[i].error   = "AMOUNT_IN_REQUIRED";
      pairResults[i].message = "amountIn must be provided for exact-input quoting (v2)";
      return;
    }

    // path: либо из pair.path, либо [tokenIn, tokenOut]
    const pathInOut = (pair.path?.length ?? 0) > 1
      ? pair.path!.map(t => ethers.getAddress(t.address))
      : [tokenInAddr, tokenOutAddr];

    try {
      // -------- exact-in: getAmountsOut --------
      const amountsOut: bigint[] = await v2Router.getAmountsOut(amountIn, pathInOut);
      const v2AmountOutExactIn = amountsOut[amountsOut.length - 1].toString();

      // -------- exact-out: getAmountsIn (если задан amountOut) --------
      let v2AmountInExactOut: string | undefined;
      if (amountOut !== undefined) {
        const pathOutIn = [...pathInOut].reverse();
        const amountsIn: bigint[] = await v2Router.getAmountsIn(amountOut, pathOutIn);
        v2AmountInExactOut = amountsIn[0].toString();
      }

      // Адаптируем под структуру, "как будто это V3"
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

    } catch (e: any) {
      pairResults[i].error   = "V2_ROUTER_REVERT";
      pairResults[i].message = e?.shortMessage || e?.message || String(e);
      return;
    }
  });

  // ждём, пока все запросы завершатся
  await Promise.all(tasks);

  const latencyMs = Date.now() - startedAt;

  return {
    ok: true,
    latencyMs,
    result: pairResults,
  };
}
