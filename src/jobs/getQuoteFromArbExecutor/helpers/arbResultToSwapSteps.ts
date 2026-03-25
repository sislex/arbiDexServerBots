import {
  ArbResult,
  IContractStep,
  IQuote,
  SwapKind,
  ZERO_ADDRESS,
  Address,
} from '../../../store/state.types';

/**
 * V2 router addresses на Arbitrum (совпадают с poolConfigToStoreSteps)
 */
const V2_ROUTERS: Record<string, string> = {
  uniswap: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  sushi:   '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  camelot: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
};

function resolveSwapKind(dex: string, version: string): SwapKind {
  if (version === 'v2') {
    return dex === 'camelot' ? SwapKind.CAMELOT_V2_EXACT_IN : SwapKind.V2_EXACT_IN;
  }
  if (version === 'v3') {
    return dex === 'camelot' ? SwapKind.ALGEBRA_POOL_EXACT_IN : SwapKind.V3_POOL_EXACT_IN;
  }
  throw new Error(`Unknown version: ${version}`);
}

/**
 * Конвертирует прибыльный ArbResult из findArbStore/findArb
 * в 2 шага IContractStep[] для ArbExecutor.executeSwaps.
 *
 * Шаг 0 (BUY):  tokenIn → tokenOut через buyPool,  amountIn = amount из pairsToQuote
 * Шаг 1 (SELL): tokenOut → tokenIn через sellPool, amountIn = 0 (контракт возьмёт prevOut)
 *
 * profitToken = tokenIn (замкнутый арбитражный цикл)
 */
export function arbResultToSwapSteps(
  arb: ArbResult,
  pairsToQuote: IQuote[],
  slippageBps = 30n, // 0.30% по умолчанию
): { steps: IContractStep[]; profitToken: string } {
  const buyQuote  = pairsToQuote[arb.buyIndex];
  const sellQuote = pairsToQuote[arb.sellIndex];

  if (!buyQuote)  throw new Error(`No pairsToQuote at buyIndex=${arb.buyIndex}`);
  if (!sellQuote) throw new Error(`No pairsToQuote at sellIndex=${arb.sellIndex}`);

  const tokenIn  = buyQuote.tokenIn.address as Address;
  const tokenMid = buyQuote.tokenOut.address as Address;
  const amountIn = BigInt(buyQuote.amount);

  const isV2Buy  = buyQuote.version === 'v2';
  const isV2Sell = sellQuote.version === 'v2';

  // BUY (step 0): amountOutMin = 0 — на промежуточном шаге не ограничиваем.
  // Нас не волнует сколько получим на BUY, важен только итоговый результат SELL.
  // Если поставить slippage на BUY — при движении цены получим revert
  // на роутере (INSUFFICIENT_OUTPUT_AMOUNT) даже если итоговый арбитраж прибылен.
  const amountOutMinBuy = 0n;

  // SELL (step 1): минимум = amountIn (вложенная сумма) — гарантируем безубыточность.
  // Если sell вернёт меньше amountIn → revert SLIPPAGE раньше чем ArbExecutionLoss,
  // что дешевле по gas.
  const amountOutMinSell = amountIn;

  // ── Шаг 0: BUY (tokenIn → tokenMid) ──
  const step0: IContractStep = {
    kind: resolveSwapKind(buyQuote.dex, buyQuote.version),

    router: (isV2Buy ? V2_ROUTERS[buyQuote.dex] ?? ZERO_ADDRESS : ZERO_ADDRESS) as Address,
    path:   isV2Buy ? [tokenIn, tokenMid] : [],

    pool: (!isV2Buy && buyQuote.poolAddress ? buyQuote.poolAddress : ZERO_ADDRESS) as Address,

    tokenIn,
    tokenOut: tokenMid,

    amountIn,
    amountOutMin: amountOutMinBuy,

    sqrtPriceLimitX96: 0,
    deadline: 0,
  };

  // ── Шаг 1: SELL (tokenMid → tokenIn) ──
  const step1: IContractStep = {
    kind: resolveSwapKind(sellQuote.dex, sellQuote.version),

    router: (isV2Sell ? V2_ROUTERS[sellQuote.dex] ?? ZERO_ADDRESS : ZERO_ADDRESS) as Address,
    path:   isV2Sell ? [tokenMid, tokenIn] : [],

    pool: (!isV2Sell && sellQuote.poolAddress ? sellQuote.poolAddress : ZERO_ADDRESS) as Address,

    tokenIn: tokenMid,
    tokenOut: tokenIn,

    amountIn:     0n,            // контракт автоматически берёт prevOut (step index == 1)
    amountOutMin: amountOutMinSell,

    sqrtPriceLimitX96: 0,
    deadline: 0,
  };

  return {
    steps: [step0, step1],
    profitToken: tokenIn,
  };
}

/**
 * Применяет slippage к шагам для реальной транзакции.
 * simulationLogs — результат симуляции (amountOut каждого шага).
 */
export function applySlippage(
  steps: IContractStep[],
  simulationAmountOuts: bigint[],
  slippageBps = 30n, // 0.30%
): IContractStep[] {
  const denom = 10_000n;
  return steps.map((step, i) => ({
    ...step,
    amountOutMin: simulationAmountOuts[i]
      ? (simulationAmountOuts[i] * (denom - slippageBps)) / denom
      : 0n,
  }));
}


