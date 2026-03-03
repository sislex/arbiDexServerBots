import {ethers} from 'ethers';
import {
  ArbResult,
  IJobParams_get_Arbitrum_Arb_Executor_Quotes, IQuote
} from '../../store/state.types';
import {poolConfigToStoreStep, StoreSwapStep} from './helpers/poolConfigToStoreSteps';
import {mapArbResult} from './helpers/mapArbResult';
import {setup} from './helpers/setup';
import {printArbResults} from './helpers/printArbResults';

// ══════════════════════════════════════════════════════════════
// Вариант 1: quoteBuysDirect → группировка на сервере → scanArbPairsDirect
// ══════════════════════════════════════════════════════════════
export async function getArbViaScanPairs(
  params: IJobParams_get_Arbitrum_Arb_Executor_Quotes,
): Promise<any> {
  const totalStart = performance.now();
  const metrics: { step: string; ms: number }[] = [];
  const { pairsToQuote, rpcUrl = "https://arb-mainnet.g.alchemy.com/v2/_T_Qkk4fOdQ7jQbGjSW2F" } = params;

  // setup
  let t0 = performance.now();
  const { reader } = setup(rpcUrl);
  metrics.push({ step: 'setup', ms: performance.now() - t0 });

  // convertToRawSteps
  t0 = performance.now();
  const rawSteps: StoreSwapStep[] = pairsToQuote.map((q) => poolConfigToStoreStep(q as any));
  metrics.push({ step: 'convertToRawSteps', ms: performance.now() - t0 });

  if (rawSteps.length === 0) return { ok: false, error: 'No steps' };

  const amountIn = BigInt(pairsToQuote[0].amount);

  // quoteBuysDirect
  t0 = performance.now();
  const buyResult = await reader.quoteBuysDirect.staticCall(rawSteps, amountIn);
  metrics.push({ step: 'quoteBuysDirect.staticCall', ms: performance.now() - t0 });

  const { quotes, blockNumber, gasUsed } = buyResult;

  // группировка
  t0 = performance.now();
  const groupsMap = new Map<string, { indices: number[]; amountOuts: bigint[] }>();
  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];
    if (!q.success) continue;
    const key = `${q.tokenIn.toLowerCase()}|${q.tokenOut.toLowerCase()}`;
    if (!groupsMap.has(key)) groupsMap.set(key, { indices: [], amountOuts: [] });
    const g = groupsMap.get(key)!;
    g.indices.push(i);
    g.amountOuts.push(q.amountOut);
  }

  const arbPairsInput: { buyIndex: number; sellIndex: number }[] = [];
  for (const [, group] of groupsMap) {
    if (group.indices.length < 2) continue; // нужно минимум 2 пула для арбитража
    let bestIdx = 0;
    let bestOut = group.amountOuts[0];
    for (let j = 1; j < group.amountOuts.length; j++) {
      if (group.amountOuts[j] > bestOut) { bestOut = group.amountOuts[j]; bestIdx = j; }
    }
    const buyIndex = group.indices[bestIdx];
    for (let j = 0; j < group.indices.length; j++) {
      if (j === bestIdx) continue; // не продаём через тот же пул
      arbPairsInput.push({ buyIndex, sellIndex: group.indices[j] });
    }
  }
  metrics.push({ step: 'groupAndBuildPairs', ms: performance.now() - t0 });

  if (arbPairsInput.length === 0) {
    const totalMs = performance.now() - totalStart;
    return { ok: true, method: 'scanPairs', latencyMs: Math.round(totalMs), metrics, profitableResults: [] };
  }

  // scanArbPairsDirect
  const profitToken = pairsToQuote[0].tokenIn.address;
  t0 = performance.now();
  const scanResult = await reader.scanArbPairsDirect.staticCall(rawSteps, amountIn, profitToken, arbPairsInput);
  metrics.push({ step: 'scanArbPairsDirect.staticCall', ms: performance.now() - t0 });

  // маппинг
  t0 = performance.now();
  const mapped: ArbResult[] = scanResult.results.map((r: any) => mapArbResult(r, pairsToQuote));
  const profitableResults = printArbResults('scanPairs', mapped);
  console.log(`blockNumber: ${blockNumber}, storeStep: ${rawSteps.length}, mapped: ${mapped.length}`);
  metrics.push({ step: 'mapResults', ms: performance.now() - t0 });

  const totalMs = performance.now() - totalStart;
  console.log('\n⏱  scanPairs Metrics:');
  console.table(metrics.map(m => ({ step: m.step, ms: `${m.ms.toFixed(1)} ms` })));
  console.log(`scanPairs Total: ${totalMs.toFixed(1)} ms\n`);

  return {
    ok: true,
    method: 'scanPairs',
    blockNumber: Number(blockNumber),
    latencyMs: Math.round(totalMs),
    metrics: metrics.map(m => ({ step: m.step, ms: Math.round(m.ms) })),
    arbPairsCount: arbPairsInput.length,
    resultsCount: mapped.length,
    allResults: mapped,
    profitableResults,
  };
}

// ══════════════════════════════════════════════════════════════
// Вариант 2: findArbDirect (всё на стороне контракта)
// ══════════════════════════════════════════════════════════════
export async function getArbViaFindArb(
  params: IJobParams_get_Arbitrum_Arb_Executor_Quotes,
): Promise<any> {
  const totalStart = performance.now();
  const metrics: { step: string; ms: number }[] = [];
  const { pairsToQuote, rpcUrl = "https://arb-mainnet.g.alchemy.com/v2/_T_Qkk4fOdQ7jQbGjSW2F" } = params;



  console.log('rpcUrl:', rpcUrl);

  // setup
  let t0 = performance.now();
  const { reader } = setup(rpcUrl);
  metrics.push({ step: 'setup', ms: performance.now() - t0 });

  // convertToRawSteps
  t0 = performance.now();
  const rawSteps: StoreSwapStep[] = pairsToQuote.map((q) => poolConfigToStoreStep(q as any));
  metrics.push({ step: 'convertToRawSteps', ms: performance.now() - t0 });

  if (rawSteps.length === 0) return { ok: false, error: 'No steps' };

  const amountIn    = BigInt(pairsToQuote[0].amount);
  const profitToken = pairsToQuote[0].tokenIn.address;

  // findArbDirect — одним вызовом контракт делает всё: группировку, bestBuy, sell
  t0 = performance.now();
  const arbResult = await reader.findArbDirect.staticCall(rawSteps, amountIn, profitToken);
  metrics.push({ step: 'findArbDirect.staticCall', ms: performance.now() - t0 });

  const { groups: arbGroups, blockNumber, gasUsed } = arbResult;

  // Строим маппинг локальных индексов группы → глобальные индексы rawSteps
  // Контракт группирует по tokenIn+tokenOut, порядок — порядок появления в rawSteps
  const groupLocalToGlobal = new Map<string, number[]>(); // key → [globalIdx, ...]
  for (let i = 0; i < rawSteps.length; i++) {
    const step = rawSteps[i];
    const key = `${step.tokenIn.toLowerCase()}|${step.tokenOut.toLowerCase()}`;
    if (!groupLocalToGlobal.has(key)) groupLocalToGlobal.set(key, []);
    groupLocalToGlobal.get(key)!.push(i);
  }

  // маппинг групп → единый формат ArbResult[]
  t0 = performance.now();
  const mapped: ArbResult[] = [];

  for (const g of arbGroups) {
    const groupKey = `${g.tokenIn.toLowerCase()}|${g.tokenOut.toLowerCase()}`;
    const globalIndices = groupLocalToGlobal.get(groupKey) ?? [];

    const localBestBuyIdx = Number(g.bestBuyIndex);
    const globalBestBuyIdx = globalIndices[localBestBuyIdx] ?? localBestBuyIdx;

    for (const s of g.sells) {
      const localSellIdx = Number(s.sellPoolIndex);
      const globalSellIdx = globalIndices[localSellIdx] ?? localSellIdx;

      // не продаём через тот же пул, что и покупаем
      if (globalSellIdx === globalBestBuyIdx) continue;

      const buyP  = pairsToQuote[globalBestBuyIdx];
      const sellP = pairsToQuote[globalSellIdx];
      mapped.push({
        buyIndex:  globalBestBuyIdx,
        sellIndex: globalSellIdx,
        buyPair:  buyP  ? `${buyP.dex}-${buyP.version}`  : undefined,
        sellPair: sellP ? `${sellP.dex}-${sellP.version}` : undefined,
        profit:        s.profit.toString(),
        buyAmountOut:  s.buyAmountOut.toString(),
        sellAmountOut: s.sellAmountOut.toString(),
        gasUsed:       s.gasUsed.toString(),
        success:       s.success,
      });
    }
  }

  const profitableResults = printArbResults('findArb', mapped);
  console.log(`blockNumber: ${blockNumber}, storeStep: ${rawSteps.length}, mapped: ${mapped.length}`);

  metrics.push({ step: 'mapResults', ms: performance.now() - t0 });

  const totalMs = performance.now() - totalStart;
  console.log('\n⏱  findArb Metrics:');
  console.table(metrics.map(m => ({ step: m.step, ms: `${m.ms.toFixed(1)} ms` })));
  console.log(`findArb Total: ${totalMs.toFixed(1)} ms\n`);

  return {
    ok: true,
    method: 'findArb',
    blockNumber: Number(blockNumber),
    latencyMs: Math.round(totalMs),
    metrics: metrics.map(m => ({ step: m.step, ms: Math.round(m.ms) })),
    groupsCount: arbGroups.length,
    resultsCount: mapped.length,
    allResults: mapped,
    profitableResults,
  };
}

// ══════════════════════════════════════════════════════════════
// Вариант 3: findArb (конфиги из on-chain store по ключу)
// ══════════════════════════════════════════════════════════════
export async function getArbViaFindArbStore(
  params: IJobParams_get_Arbitrum_Arb_Executor_Quotes,
  storeKey = 'pools33',
): Promise<any> {
  const totalStart = performance.now();
  const metrics: { step: string; ms: number }[] = [];
  const { pairsToQuote, rpcUrl = "https://arb1.arbitrum.io/rpc" } = params;

  // setup
  let t0 = performance.now();
  const { reader } = setup(rpcUrl);
  metrics.push({ step: 'setup', ms: performance.now() - t0 });

  if (pairsToQuote.length === 0) return { ok: false, error: 'No pairsToQuote' };

  const amountIn    = BigInt(pairsToQuote[0].amount);
  const profitToken = pairsToQuote[0].tokenIn.address;
  const key         = ethers.id(storeKey);

  // Читаем конфиги из store и запускаем findArb параллельно
  t0 = performance.now();
  const [storeSteps, arbResult] = await Promise.all([
    reader.getConfig(key),
    reader.findArb.staticCall(key, amountIn, profitToken),
  ]);
  metrics.push({ step: 'getConfig + findArb.staticCall', ms: performance.now() - t0 });

  const { groups: arbGroups, blockNumber, gasUsed } = arbResult;

  // Строим маппинг: store step index → pairsToQuote index
  // Ключ: tokenIn|tokenOut|pool|router (lowercase)
  t0 = performance.now();

  function pairKey(tokenIn: string, tokenOut: string, pool: string, router: string): string {
    return `${tokenIn.toLowerCase()}|${tokenOut.toLowerCase()}|${pool.toLowerCase()}|${router.toLowerCase()}`;
  }

  // Индекс pairsToQuote по ключу
  const pqByKey = new Map<string, number>();
  const rawSteps: StoreSwapStep[] = pairsToQuote.map((q) => poolConfigToStoreStep(q as any));
  for (let i = 0; i < rawSteps.length; i++) {
    const s = rawSteps[i];
    pqByKey.set(pairKey(s.tokenIn, s.tokenOut, s.pool, s.router), i);
  }

  // Маппинг store index → global pairsToQuote index
  const storeToGlobal: number[] = [];
  for (let i = 0; i < storeSteps.length; i++) {
    const s = storeSteps[i];
    const k = pairKey(s.tokenIn, s.tokenOut, s.pool, s.router);
    storeToGlobal.push(pqByKey.get(k) ?? -1);
  }

  // Строим группы по store-шагам (так же как контракт)
  const groupStoreIndices = new Map<string, number[]>();
  for (let i = 0; i < storeSteps.length; i++) {
    const s = storeSteps[i];
    const gk = `${s.tokenIn.toLowerCase()}|${s.tokenOut.toLowerCase()}`;
    if (!groupStoreIndices.has(gk)) groupStoreIndices.set(gk, []);
    groupStoreIndices.get(gk)!.push(i);
  }

  const mapped: ArbResult[] = [];

  for (const g of arbGroups) {
    const groupKey = `${g.tokenIn.toLowerCase()}|${g.tokenOut.toLowerCase()}`;
    const storeIndices = groupStoreIndices.get(groupKey) ?? [];

    const localBestBuyIdx = Number(g.bestBuyIndex);
    const globalBestBuyIdx = storeToGlobal[storeIndices[localBestBuyIdx] ?? -1] ?? -1;

    for (const s of g.sells) {
      const localSellIdx = Number(s.sellPoolIndex);
      const globalSellIdx = storeToGlobal[storeIndices[localSellIdx] ?? -1] ?? -1;

      if (globalSellIdx === globalBestBuyIdx) continue;
      if (globalBestBuyIdx < 0 || globalSellIdx < 0) continue;

      const buyP  = pairsToQuote[globalBestBuyIdx];
      const sellP = pairsToQuote[globalSellIdx];
      mapped.push({
        buyIndex:  globalBestBuyIdx,
        sellIndex: globalSellIdx,
        buyPair:  buyP  ? `${buyP.dex}-${buyP.version}`  : undefined,
        sellPair: sellP ? `${sellP.dex}-${sellP.version}` : undefined,
        profit:        s.profit.toString(),
        buyAmountOut:  s.buyAmountOut.toString(),
        sellAmountOut: s.sellAmountOut.toString(),
        gasUsed:       s.gasUsed.toString(),
        success:       s.success,
      });
    }
  }

  const profitableResults = printArbResults('findArbStore', mapped);
  console.log(`blockNumber: ${blockNumber}, storeSteps: ${storeSteps.length}, mapped: ${mapped.length}, storeKey: ${storeKey}`);

  metrics.push({ step: 'mapResults', ms: performance.now() - t0 });

  const totalMs = performance.now() - totalStart;
  console.log('\n⏱  findArbStore Metrics:');
  console.table(metrics.map(m => ({ step: m.step, ms: `${m.ms.toFixed(1)} ms` })));
  console.log(`findArbStore Total: ${totalMs.toFixed(1)} ms\n`);

  return {
    ok: true,
    method: 'findArbStore',
    storeKey,
    blockNumber: Number(blockNumber),
    latencyMs: Math.round(totalMs),
    metrics: metrics.map(m => ({ step: m.step, ms: Math.round(m.ms) })),
    groupsCount: arbGroups.length,
    storeStepsCount: storeSteps.length,
    resultsCount: mapped.length,
    allResults: mapped,
    profitableResults,
  };
}

// ── backward-compat alias ────────────────────────────────────
export const getArbExecutorQuotes = getArbViaFindArbStore;
