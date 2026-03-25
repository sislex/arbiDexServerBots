import {
  DexCexComparisonResult,
  IContractStep,
  IQuote,
  SwapKind,
  ZERO_ADDRESS,
  Address,
} from '../../../store/state.types';

/**
 * V2 router addresses на Arbitrum
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

export type SignalDirection = 'buy' | 'sell';

/**
 * Конвертирует результат dexCexComparison в 1 шаг IContractStep для ArbExecutor.executeSwaps.
 *
 * pairsToQuote задаёт направление WETH → USDC (tokenIn=WETH, tokenOut=USDC).
 *
 * - 'sell' (SELL ETH на DEX) → прямой swap: WETH → USDC через bestBuyPool
 *   (bestBuyPool — пул с лучшим курсом WETH→USDC, т.е. больше всего USDC за ETH)
 *
 * - 'buy' (BUY ETH на DEX) → обратный swap: USDC → WETH через bestSellPool
 *   (bestSellPool — пул с лучшим курсом USDC→WETH, т.е. больше всего WETH за USDC)
 *
 * Возвращает { steps, profitToken }:
 *   - steps: [IContractStep] — один шаг для executeSwaps
 *   - profitToken: адрес токена, в котором считаем прибыль
 */
export function dexCexResultToSwapStep(
  result: DexCexComparisonResult,
  pairsToQuote: IQuote[],
  direction: SignalDirection,
): { steps: IContractStep[]; profitToken: string } {
  if (!result.ok) {
    throw new Error(`Cannot build steps: result not ok — ${result.error}`);
  }

  // SELL ETH → используем bestBuyPool (лучший курс WETH→USDC)
  // BUY ETH  → используем bestSellPool (лучший курс USDC→WETH, т.е. обратный swap)
  const poolIndex = direction === 'sell' ? result.bestBuyIndex : result.bestSellIndex;
  const poolName  = direction === 'sell' ? result.bestBuyPool  : result.bestSellPool;

  if (poolIndex < 0 || poolIndex >= pairsToQuote.length) {
    throw new Error(`Invalid pool index ${poolIndex} for direction=${direction} (${poolName})`);
  }

  const pair = pairsToQuote[poolIndex];
  const kind = resolveSwapKind(pair.dex, pair.version);
  const isV2 = kind === SwapKind.V2_EXACT_IN || kind === SwapKind.CAMELOT_V2_EXACT_IN;

  // В pairsToQuote: tokenIn=WETH, tokenOut=USDC, amount = сколько WETH отправляем
  const weth = pair.tokenIn.address as Address;
  const usdc = pair.tokenOut.address as Address;
  const amountIn = BigInt(pair.amount);

  if (direction === 'sell') {
    // ── SELL ETH на DEX: WETH → USDC ──
    // Прямой swap: отправляем WETH, получаем USDC
    const step: IContractStep = {
      kind,
      router: (isV2 ? V2_ROUTERS[pair.dex] ?? ZERO_ADDRESS : ZERO_ADDRESS) as Address,
      path:   isV2 ? [weth, usdc] : [],
      pool:   (!isV2 && pair.poolAddress ? pair.poolAddress : ZERO_ADDRESS) as Address,
      tokenIn: weth,
      tokenOut: usdc,
      amountIn,
      amountOutMin: 0n, // без slippage (для симуляции)
      sqrtPriceLimitX96: 0,
      deadline: 0,
    };
    return { steps: [step], profitToken: usdc };
  } else {
    // ── BUY ETH на DEX: USDC → WETH ──
    // Обратный swap: отправляем USDC, получаем WETH
    // amountIn для USDC → берём buyAmountOut из bestBuy (кол-во USDC которое мы получим/имеем)
    // Но на контракте у нас лежит WETH, поэтому BUY ETH = замкнутый цикл:
    //   Step 0: WETH → USDC через bestBuyPool (получаем USDC)
    //   Step 1: USDC → WETH через bestSellPool (получаем WETH обратно, но дешевле)
    //
    // Это фактически арбитраж: buy cheap, sell expensive
    // Используем ту же логику что в arbResultToSwapSteps

    const buyPoolIndex = result.bestBuyIndex;
    const sellPoolIndex = result.bestSellIndex;
    const buyPair  = pairsToQuote[buyPoolIndex];
    const sellPair = pairsToQuote[sellPoolIndex];

    const buyKind  = resolveSwapKind(buyPair.dex, buyPair.version);
    const sellKind = resolveSwapKind(sellPair.dex, sellPair.version);
    const isV2Buy  = buyKind === SwapKind.V2_EXACT_IN || buyKind === SwapKind.CAMELOT_V2_EXACT_IN;
    const isV2Sell = sellKind === SwapKind.V2_EXACT_IN || sellKind === SwapKind.CAMELOT_V2_EXACT_IN;

    // Step 0: WETH → USDC через bestBuyPool (лучший ask, больше USDC за WETH)
    const step0: IContractStep = {
      kind: buyKind,
      router: (isV2Buy ? V2_ROUTERS[buyPair.dex] ?? ZERO_ADDRESS : ZERO_ADDRESS) as Address,
      path:   isV2Buy ? [weth, usdc] : [],
      pool:   (!isV2Buy && buyPair.poolAddress ? buyPair.poolAddress : ZERO_ADDRESS) as Address,
      tokenIn: weth,
      tokenOut: usdc,
      amountIn,
      amountOutMin: 0n,
      sqrtPriceLimitX96: 0,
      deadline: 0,
    };

    // Step 1: USDC → WETH через bestSellPool (лучший bid, больше WETH за USDC)
    const step1: IContractStep = {
      kind: sellKind,
      router: (isV2Sell ? V2_ROUTERS[sellPair.dex] ?? ZERO_ADDRESS : ZERO_ADDRESS) as Address,
      path:   isV2Sell ? [usdc, weth] : [],
      pool:   (!isV2Sell && sellPair.poolAddress ? sellPair.poolAddress : ZERO_ADDRESS) as Address,
      tokenIn: usdc,
      tokenOut: weth,
      amountIn: 0n,           // контракт возьмёт prevOut от step0
      amountOutMin: amountIn, // минимум = вложенная сумма (безубыточность)
      sqrtPriceLimitX96: 0,
      deadline: 0,
    };

    return { steps: [step0, step1], profitToken: weth };
  }
}

