// import { ethers } from "ethers";
// import {IGroupedQuotes, SwapKind, IContractStep, Address} from 'src/store/state.types';
// import {getV2Router} from './getV2Router.helper';
// import {toBigIntSafe} from './toBigIntSafe';
// import {ensureV3Known} from './ensureV3Known.helper';
// import {assertPool} from './assertPool.helper';
//
//
// export function buildContractStepsFromGroup(
//   group: IGroupedQuotes,
//   opts?: {
//     amountOutMin0?: bigint;
//     amountOutMin1?: bigint;
//     deadline?: number;
//     sqrtPriceLimitX96?: number;
//     /**
//      * если true — step1.amountIn = group.amountOut
//      * если false — step1.amountIn = 0n (auto from previous)
//      */
//     explicitSecondAmountIn?: boolean;
//   }
// ): { amountInStep1: bigint; steps: IContractStep[] } {
//   assertPool(group.bestSellPool, "group.bestSellPool");
//   assertPool(group.bestBuyPool, "group.bestBuyPool");
//
//   const sell = group.bestSellPool;
//   const buy = group.bestBuyPool;
//
//   // твой текущий сценарий
//   if (sell.version !== "v3") {
//     throw new Error(`bestSellPool must be v3, got "${sell.version}"`);
//   }
//   if (buy.version !== "v2") {
//     throw new Error(`bestBuyPool must be v2, got "${buy.version}"`);
//   }
//
//   ensureV3Known(sell.dex);
//   const v2Router = getV2Router(buy.dex);
//
//   const amountInStep1 = toBigIntSafe(group.amountIn);
//   if (!amountInStep1) {
//     throw new Error(`group.amountIn is empty`);
//   }
//
//   // -----------------------
//   // Step 0 — V3 exactIn
//   // -----------------------
//   const step0: IContractStep = {
//     kind: SwapKind.V3_POOL_EXACT_IN,
//
//     router: ethers.ZeroAddress as Address,
//     path: [],
//
//     pool: sell.poolAddress as Address,
//
//     tokenIn: sell.tokenIn.address as Address,
//     tokenOut: sell.tokenOut.address as Address,
//
//     amountIn: amountInStep1,
//     amountOutMin: opts?.amountOutMin0 ?? 0n,
//
//     amountOut: 0n,
//     amountInMax: 0n,
//
//     sqrtPriceLimitX96: opts?.sqrtPriceLimitX96 ?? 0,
//     deadline: opts?.deadline ?? 0,
//   };
//
//   // -----------------------
//   // Step 1 — V2 exactIn (reverse)
//   // -----------------------
//   const explicitAmountIn =
//     opts?.explicitSecondAmountIn === true
//       ? toBigIntSafe(group.amountOut) ?? 0n
//       : 0n;
//
//   const step1: IContractStep = {
//     kind: SwapKind.V2_EXACT_IN,
//
//     router: v2Router,
//     path: [
//       sell.tokenOut.address as Address,
//       sell.tokenIn.address as Address,
//     ],
//
//     pool: ethers.ZeroAddress as Address,
//
//     tokenIn: sell.tokenOut.address as Address,
//     tokenOut: sell.tokenIn.address as Address,
//
//     amountIn: explicitAmountIn,
//     amountOutMin: opts?.amountOutMin1 ?? 0n,
//
//     amountOut: 0n,
//     amountInMax: 0n,
//
//     sqrtPriceLimitX96: 0,
//     deadline: opts?.deadline ?? 0,
//   };
//
//   return {
//     amountInStep1,
//     steps: [step0, step1],
//   };
// }
