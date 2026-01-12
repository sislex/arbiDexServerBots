// // src/helpers/arbitrageToContractSteps.ts
// import {
//   IContractStep, IGroupedQuotes,
//   SwapKind,
//   V2DexesMap,
//   ZERO_ADDRESS
// } from '../../store/state.types';
//
// import { biReq } from "../../helpers/biReq.helper";
// import { asAddress } from "../../helpers/asAddress.helper";
// import { v2RouterOf } from "../../helpers/v2RouterOf.helper";
// import { requireAddress } from "../../helpers/requireAddress.helper";
// type TwoStepsConfig = [IContractStep, IContractStep];
//
// // floor slippage: outMin = out * (1 - bps/10000)
// function addSlippageFloor(amount: bigint, slippageBps: number): bigint {
//   if (slippageBps <= 0) return amount;
//   const bps = BigInt(slippageBps);
//   const denom = 10_000n;
//   return (amount * (denom - bps)) / denom; // floor
// }
//
// /**
//  * 2 шага:
//  * 0) BUY  - EXACT_IN   (tokenIn -> tokenMid), amountIn берём из group.amountIn
//  * 1) SELL - EXACT_IN   (tokenMid -> tokenIn), amountIn=0n => контракт сам возьмёт prevOut
//  */
// export function arbitrageToTwoStepsConfigs(
//   group: IGroupedQuotes,
//   opts: {
//     v2Dexes: V2DexesMap;
//     slippageBps: number;        // например 30 = 0.30%
//     minProfitTokenIn?: bigint;  // smallest units tokenIn
//     deadline?: number;          // unix seconds; 0 => contract default
//     /**
//      * Если у тебя есть котировка EXACT_IN для BUY (out в tokenMid),
//      * передай сюда (или добавь в group), чтобы выставить amountOutMinBuy.
//      * Если не передашь — amountOutMinBuy будет 0n (без защиты от проскальзывания).
//      */
//     buyQuoteAmountOut?: bigint; // tokenMid smallest units (optional)
//   }
// ): TwoStepsConfig {
//   const {
//     v2Dexes,
//     slippageBps,
//     minProfitTokenIn = 1n,
//     deadline = 0,
//     buyQuoteAmountOut,
//   } = opts;
//
// // console.log('group', group);
//
//   const tokenIn = asAddress(group.tokenIn.address);
//   const tokenMid = asAddress(group.tokenOut.address);
//
//   // ✅ BUY exactIn amount: берём вход из group.amountIn (tokenIn smallest units)
//   const amountInBuy = biReq(group.amountIn, "group.amountIn");
//
//   // ✅ outMin для BUY (tokenMid units)
//   // если есть точная котировка EXACT_IN для buy-пула — используем её,
//   // иначе 0n (чтобы не ловить ревёрты из-за неверных decimals/котировки)
//   const amountOutMinBuy =
//     buyQuoteAmountOut != null
//       ? addSlippageFloor(buyQuoteAmountOut, slippageBps)
//       : 0n;
//
//   // ✅ profit-guard для SELL: хотим получить tokenIn >= amountInBuy + minProfitTokenIn
//   // (это tokenIn units, т.к. step1.tokenOut = tokenIn)
//   const amountOutMinSell = amountInBuy + minProfitTokenIn;
//
//   // --- step #0 (BUY) EXACT_IN ---
//   const buyPool = group.bestBuyPool!;
//   const buyIsV2 = buyPool.version === "v2";
//   const buyIsV3 = buyPool.version === "v3";
//
//   const step0: IContractStep = {
//     kind: buyIsV2 ? SwapKind.V2_EXACT_IN : SwapKind.V3_POOL_EXACT_IN,
//
//     router: buyIsV2 ? v2RouterOf(buyPool.dex, v2Dexes) : asAddress(ZERO_ADDRESS),
//     path: buyIsV2 ? [tokenIn, tokenMid] : [],
//
//     pool: buyIsV3
//       ? requireAddress(buyPool.poolAddress, "buyPool.poolAddress")
//       : asAddress(ZERO_ADDRESS),
//
//     tokenIn,
//     tokenOut: tokenMid,
//
//     // exactIn поля
//     amountIn: amountInBuy,
//     amountOutMin: amountOutMinBuy,
//
//     // exactOut поля (не используются)
//     amountOut: 0n,
//     amountInMax: 0n,
//
//     sqrtPriceLimitX96: 0,
//     deadline,
//   };
//
//   // --- step #1 (SELL) EXACT_IN ---
//   const sellPool = group.bestSellPool!;
//   const sellIsV2 = sellPool.version === "v2";
//   const sellIsV3 = sellPool.version === "v3";
//
//   const step1: IContractStep = {
//     kind: sellIsV2 ? SwapKind.V2_EXACT_IN : SwapKind.V3_POOL_EXACT_IN,
//
//     router: sellIsV2 ? v2RouterOf(sellPool.dex, v2Dexes) : asAddress(ZERO_ADDRESS),
//     path: sellIsV2 ? [tokenMid, tokenIn] : [],
//
//     pool: sellIsV3
//       ? requireAddress(sellPool.poolAddress, "sellPool.poolAddress")
//       : asAddress(ZERO_ADDRESS),
//
//     tokenIn: tokenMid,
//     tokenOut: tokenIn,
//
//     // ✅ продаём ровно то, что реально получили на шаге 0
//     amountIn: 0n,
//     // amountOutMin: amountOutMinSell,  // защита от убытка
//     amountOutMin: 0n,
//
//     amountOut: 0n,
//     amountInMax: 0n,
//
//     sqrtPriceLimitX96: 0,
//     deadline,
//   };
//
//   // console.log('[step0, step1]', [step0, step1]);
//
//   return [step0, step1];
// }
