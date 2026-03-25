// import { ethers, Interface } from 'ethers';
// import {
//   CexQuote,
//   IContractStep,
//   IJobParams_get_Arbitrum_Arb_Executor_Quotes,
//   IQuote,
//   SwapKind,
//   ZERO_ADDRESS,
//   Address, IJobParams_get_Best_Sell_Quotes, IJobParams_get_Dex_Quotes_By_Arb_Quoter
// } from '../../store/state.types';
// import { poolConfigToStoreStep, StoreSwapStep } from '../getQuoteFromArbExecutor/helpers/poolConfigToStoreSteps';
// import { setup } from '../getQuoteFromArbExecutor/helpers/setup';
// import { fetchExecutorBalances, } from '../getExecutorBalances/helpers/fetchExecutorBalances';
// import { TokenBalanceInfo } from '../getExecutorBalances/getExecutorBalances';
// import { getBinanceQuote } from '../getQuoteFromArbExecutor/helpers/getBinanceQuote';
// import { getMexcQuote } from '../getQuoteFromArbExecutor/helpers/getMexcQuote';
// import { getBybitQuote } from '../getQuoteFromArbExecutor/helpers/getBybitQuote';
// import { toCexQuote } from '../getQuoteFromArbExecutor/helpers/toCexQuote';
// import ArbExecutorAbi from '../../artifacts/contracts/ArbExecutor.sol/ArbExecutor.json';
// import {USDC, WETH} from '../../store/stabs/tokens.stabs';
//
// // ── Типы ─────────────────────────────────────────────────────
//
// /** Известные символы по адресам (fallback если symbol не задан в IQuote) */
// const KNOWN_SYMBOLS: Record<string, string> = {
//   '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': 'WETH',
//   '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 'USDC',
//   '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT',
//   '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': 'USDC.e',
//   '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': 'WBTC',
// };
//
// function resolveSymbol(token: { address: string; symbol?: string }): string {
//   return token.symbol || KNOWN_SYMBOLS[token.address.toLowerCase()] || 'TOKEN';
// }
//
// /** Веса CEX для средневзвешенного курса */
// const CEX_WEIGHT: Record<string, number> = {
//   Binance: 4,
//   Bybit:   4,
//   MEXC:    3,
// };
//
// /** Слипадж для симуляции свопа: 0.01% = 10 ppm (parts per million) */
// const SWAP_SLIPPAGE_PPM = 500n; // 0.005%
//
// /** Порог: DEX bid должен быть выше W-AVG CEX mid на этот % */
// const DEX_SIGNAL_THRESHOLD_PCT = 0.05;
//
// function getThresholdPct(tokenAddress: string): number {
//   if (tokenAddress === USDC.address.toLowerCase()) {
//     return 0.015;
//   } else if (tokenAddress === WETH.address.toLowerCase()) {
//     return 0.030;
//   } else {
//     return DEX_SIGNAL_THRESHOLD_PCT;
//   }
// }
//
// /** V2 routers на Arbitrum */
// const V2_ROUTERS: Record<string, string> = {
//   uniswap: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
//   sushi:   '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
//   camelot: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
// };
//
// function resolveSwapKind(dex: string, version: string): SwapKind {
//   if (version === 'v2') {
//     return dex === 'camelot' ? SwapKind.CAMELOT_V2_EXACT_IN : SwapKind.V2_EXACT_IN;
//   }
//   if (version === 'v3') {
//     return dex === 'camelot' ? SwapKind.ALGEBRA_POOL_EXACT_IN : SwapKind.V3_POOL_EXACT_IN;
//   }
//   throw new Error(`Unknown version: ${version}`);
// }
//
// /** Применяет slippage: outMin = amountOut * (1_000_000 - ppm) / 1_000_000 */
// function applySlippagePpm(amountOut: bigint, ppm: bigint): bigint {
//   return (amountOut * (1_000_000n - ppm)) / 1_000_000n;
// }
//
// const arbExecutorIface = new Interface(ArbExecutorAbi.abi);
//
// function decodeRevert(error: any) {
//   const data =
//     error?.data ||
//     error?.error?.data ||
//     error?.receipt?.revertReason ||
//     error?.info?.error?.data;
//
//   if (!data || typeof data !== 'string') {
//     return { type: 'UNKNOWN', message: error?.message ?? 'Unknown error' };
//   }
//   try {
//     const decoded = arbExecutorIface.parseError(data);
//     return { type: 'CUSTOM_ERROR', name: decoded?.name, args: decoded?.args };
//   } catch {
//     return { type: 'RAW_REVERT', data };
//   }
// }
//
// /**
//  * Маппинг пары tokenIn|tokenOut → CEX-символы.
//  * Ключ: `${tokenIn.toLowerCase()}|${tokenOut.toLowerCase()}`
//  */
// const CEX_PAIR_MAP: Record<string, { binance: string | null; mexc: string | null; bybit: string | null }> = {
//   // WETH → USDC
//   [`0x82af49447d8a07e3bd95bd0d56f35241523fbab1|0xaf88d065e77c8cc2239327c5edb3a432268e5831`]: {
//     binance: 'ETHUSDC', mexc: 'ETHUSDT', bybit: 'ETHUSDT',
//   },
//   // WBTC → WETH
//   [`0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f|0x82af49447d8a07e3bd95bd0d56f35241523fbab1`]: {
//     binance: null, mexc: null, bybit: null, // нет прямой пары BTC/ETH на CEX
//   },
//   // WETH → USDT
//   [`0x82af49447d8a07e3bd95bd0d56f35241523fbab1|0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9`]: {
//     binance: 'ETHUSDT', mexc: 'ETHUSDT', bybit: 'ETHUSDT',
//   },
//   // WBTC → USDC
//   [`0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f|0xaf88d065e77c8cc2239327c5edb3a432268e5831`]: {
//     binance: 'BTCUSDC', mexc: 'BTCUSDT', bybit: 'BTCUSDT',
//   },
// };
//
// export interface IDexTokenConfig {
//   address: string;
//   amount: bigint;
// }
//
// export interface ITokenPair {
//   tokenIn: IDexTokenConfig;   // address
//   tokenOut: IDexTokenConfig;  // address
// }
//
// export interface GetBestSellQuoteOpts {
//   /** Пары токенов, по которым фильтруем pairsToQuote */
//   pair: ITokenPair;
//   /** Вывод в консоль (по умолчанию false) */
//   consoleOutput?: boolean;
//   /** Выполнить реальный своп (по умолчанию false — только симуляция) */
//   executeReal?: boolean;
//   /** Макс. цена газа в gwei (по умолчанию 0.5) */
//   maxFeePerGasGwei?: number;
//   /** Чаевые за газ в gwei (по умолчанию 0.1) */
//   maxPriorityFeePerGasGwei?: number;
// }
//
// export interface BestSellQuoteResult {
//   ok: boolean;
//   latencyMs: number;
//   blockNumber: number;
//   error?: string;
//
//   // Баланс контракта
//   executorAddress: string;
//   ethBalance: string;
//   tokens: TokenBalanceInfo[];
//
//   // Токен для продажи (первый с балансом)
//   sellToken: { address: string; symbol: string; decimals: number; balance: string; formatted: string } | null;
//
//   // Отфильтрованные пулы
//   filteredPairsCount: number;
//
//   // Лучшая котировка
//   bestQuote: {
//     poolIndex: number;
//     dex: string;
//     version: string;
//     poolAddress: string;
//     amountIn: string;
//     amountOut: string;
//     amountOutFormatted: string;
//     tokenOutDecimals: number;
//     tokenOutSymbol: string;
//     gasUsed: string;
//   } | null;
//
//   allQuotes: {
//     poolIndex: number;
//     dex: string;
//     version: string;
//     poolAddress: string;
//     amountOut: string;
//     amountOutFormatted: string;
//     success: boolean;
//     gasUsed: string;
//   }[];
//
//   // CEX котировки
//   cexQuotes: CexQuote[];
//
//   // Средневзвешенный CEX (Binance=4, Bybit=3, MEXC=2)
//   weightedAvgCexMid: number;
//   weightedAvgCexBid: number;
//   weightedAvgCexAsk: number;
//   weightedAvgCexSpreadPct: number;
//   weightedAvgCexSymbol: string;
//   weightedAvgCexLatency: number;
//
//   // DEX цена за 1 tokenIn (из лучшего пула)
//   dexPrice: number;
//
//   // true если пара была развёрнута (продаём стейблкоин за ETH)
//   isReversed: boolean;
//
//   // Сигнал на обмен в DEX
//   signal: {
//     shouldSwapOnDex: boolean;
//     dexBid: number;
//     cexMidThreshold: number;
//     diffPct: number;
//     reason: string;
//   };
//
//   // Симуляция свопа (если есть сигнал)
//   simulation: {
//     executed: boolean;
//     ok: boolean;
//     latencyMs: number;
//     error?: string;
//     swapStep?: IContractStep;
//     amountIn?: string;
//     amountOut?: string;
//     amountOutFormatted?: string;
//     amountOutMin?: string;
//     amountOutMinFormatted?: string;
//     slippageBps?: number;
//     gasUsed?: string;
//     blockNumber?: number;
//     pricePerToken?: number;    // цена 1 tokenIn в tokenOut после свопа
//   };
//
//   // Реальный своп (если executeReal=true и симуляция OK)
//   realSwap: {
//     executed: boolean;
//     ok: boolean;
//     skipped: boolean;
//     reason?: string;
//     latencyMs: number;
//     txHash?: string;
//     blockNumber?: number;
//     gasUsed?: string;
//     error?: string;
//     amountOut?: string;
//     amountOutFormatted?: string;
//   };
// }
//
// export const toAmount = (value: number, decimals: number): bigint => {
//   return BigInt(Math.floor(value * 10 ** decimals));
// };
//
// export const TOKEN_PAIR: ITokenPair =  {
//   tokenIn:  { address: USDC.address, amount: toAmount(100, USDC.decimals) },
//   tokenOut: { address: WETH.address, amount: toAmount(0.03, WETH.decimals) },
// };
//
//
//
// // ── Джоба ────────────────────────────────────────────────────
//
// export async function getBestSellQuote(
//   params: IJobParams_get_Best_Sell_Quotes,
//   opts: GetBestSellQuoteOpts = {
//     pair: TOKEN_PAIR,
//     consoleOutput: true,
//     executeReal: true,
//     maxFeePerGasGwei: 0.2,
//     maxPriorityFeePerGasGwei: 0.1
//   },
// ): Promise<BestSellQuoteResult> {
//   const totalStart = performance.now();
//   const {
//     pair = TOKEN_PAIR,
//     consoleOutput= false,
//     executeReal = false,
//     maxFeePerGasGwei = 0.2,
//     maxPriorityFeePerGasGwei = 0.1
//   } = opts;
//   const { pairsToQuote, rpcUrl = 'https://arb1.arbitrum.io/rpc' } = params;
//
//   const noSimulation: BestSellQuoteResult['simulation'] = { executed: false, ok: false, latencyMs: 0 };
//   const noRealSwap: BestSellQuoteResult['realSwap'] = { executed: false, ok: false, skipped: true, reason: 'not reached', latencyMs: 0 };
//
//   const executorAddress = process.env.EXECUTOR_ADDRESS;
//   const pk = process.env.PRIVATE_KEY;
//
//   if (!executorAddress || !pk) {
//     return {
//       ok: false, latencyMs: 0, blockNumber: 0, error: 'EXECUTOR_ADDRESS или PRIVATE_KEY не задан в .env',
//       executorAddress: executorAddress ?? '', ethBalance: '0', tokens: [],
//       sellToken: null, filteredPairsCount: 0, bestQuote: null, allQuotes: [], cexQuotes: [],
//       weightedAvgCexMid: 0, weightedAvgCexBid: 0, weightedAvgCexAsk: 0, weightedAvgCexSpreadPct: 0, weightedAvgCexSymbol: '', weightedAvgCexLatency: 0, dexPrice: 0, isReversed: false, signal: { shouldSwapOnDex: false, dexBid: 0, cexMidThreshold: 0, diffPct: 0, reason: 'Early exit' },
//       simulation: noSimulation,
//       realSwap: noRealSwap,
//     };
//   }
//
//   // ── 1. Setup ──
//   const { reader, provider } = setup(rpcUrl);
//   const wallet = new ethers.Wallet(pk, provider);
//   const executor = new ethers.Contract(executorAddress, ArbExecutorAbi.abi, wallet);
//
//   // ── 2. Получаем баланс контракта ──
//   let balanceResult: { ethBal: bigint; tokens: TokenBalanceInfo[] };
//   try {
//     balanceResult = await fetchExecutorBalances(executor, provider);
//   } catch (err: any) {
//     return {
//       ok: false, latencyMs: Math.round(performance.now() - totalStart), blockNumber: 0,
//       error: `fetchExecutorBalances failed: ${err.message}`,
//       executorAddress, ethBalance: '0', tokens: [],
//       sellToken: null, filteredPairsCount: 0, bestQuote: null, allQuotes: [], cexQuotes: [],
//       weightedAvgCexMid: 0, weightedAvgCexBid: 0, weightedAvgCexAsk: 0, weightedAvgCexSpreadPct: 0, weightedAvgCexSymbol: '', weightedAvgCexLatency: 0, dexPrice: 0, isReversed: false, signal: { shouldSwapOnDex: false, dexBid: 0, cexMidThreshold: 0, diffPct: 0, reason: 'Early exit' },
//       simulation: noSimulation,
//       realSwap: noRealSwap,
//     };
//   }
//
//   // ── 3. Находим первый токен с балансом > 0 ──
//   const tokenWithBalance = balanceResult.tokens.find(t => BigInt(t.rawBalance) > 0n);
//   if (!tokenWithBalance) {
//     if (consoleOutput) console.log('❌ На контракте нет токенов с балансом');
//     return {
//       ok: false, latencyMs: Math.round(performance.now() - totalStart), blockNumber: 0,
//       error: 'Нет токенов с балансом на контракте',
//       executorAddress, ethBalance: balanceResult.ethBal.toString(), tokens: balanceResult.tokens,
//       sellToken: null, filteredPairsCount: 0, bestQuote: null, allQuotes: [], cexQuotes: [],
//       weightedAvgCexMid: 0, weightedAvgCexBid: 0, weightedAvgCexAsk: 0, weightedAvgCexSpreadPct: 0, weightedAvgCexSymbol: '', weightedAvgCexLatency: 0, dexPrice: 0, isReversed: false, signal: { shouldSwapOnDex: false, dexBid: 0, cexMidThreshold: 0, diffPct: 0, reason: 'Early exit' },
//       simulation: noSimulation,
//       realSwap: noRealSwap,
//     };
//   }
//
//   const sellTokenAddr = tokenWithBalance.address.toLowerCase();
//   const amountIn = BigInt(tokenWithBalance.rawBalance);
//
//   // ── 4. Фильтруем pairsToQuote по opts.pairs И по токену, который есть на балансе ──
//   //    Если конфиг WETH→USDC, а на контракте USDC — разворачиваем в USDC→WETH.
//   const pairKeys = new Set(
//     opts.pairs.flatMap(p => [
//       `${p.tokenIn.toLowerCase()}|${p.tokenOut.toLowerCase()}`,
//       `${p.tokenOut.toLowerCase()}|${p.tokenIn.toLowerCase()}`,   // обратная пара тоже ОК
//     ]),
//   );
//
//   const filtered: { pair: IQuote; originalIndex: number; reversed: boolean }[] = [];
//   for (let i = 0; i < pairsToQuote.length; i++) {
//     const p = pairsToQuote[i];
//     const tIn  = p.tokenIn.address.toLowerCase();
//     const tOut = p.tokenOut.address.toLowerCase();
//
//     // Прямое совпадение: tokenIn == sellToken
//     const directKey = `${tIn}|${tOut}`;
//     if (pairKeys.has(directKey) && tIn === sellTokenAddr) {
//       filtered.push({ pair: p, originalIndex: i, reversed: false });
//       continue;
//     }
//
//     // Обратное совпадение: tokenOut == sellToken → разворачиваем пару
//     const reverseKey = `${tOut}|${tIn}`;
//     if (pairKeys.has(reverseKey) && tOut === sellTokenAddr) {
//       const reversedPair: IQuote = {
//         ...p,
//         tokenIn:  p.tokenOut,
//         tokenOut: p.tokenIn,
//         // amount будет заменён на баланс контракта при вызове quoteBuysDirect
//       };
//       filtered.push({ pair: reversedPair, originalIndex: i, reversed: true });
//     }
//   }
//
//
//
//   if (filtered.length === 0) {
//     if (consoleOutput) console.log(`❌ Нет пулов для продажи ${tokenWithBalance.symbol} по заданным парам`);
//     return {
//       ok: false, latencyMs: Math.round(performance.now() - totalStart), blockNumber: 0,
//       error: `Нет пулов для продажи ${tokenWithBalance.symbol}`,
//       executorAddress, ethBalance: balanceResult.ethBal.toString(), tokens: balanceResult.tokens,
//       sellToken: {
//         address: tokenWithBalance.address, symbol: tokenWithBalance.symbol,
//         decimals: tokenWithBalance.decimals, balance: tokenWithBalance.rawBalance,
//         formatted: tokenWithBalance.formatted,
//       },
//       filteredPairsCount: 0, bestQuote: null, allQuotes: [], cexQuotes: [],
//       weightedAvgCexMid: 0, weightedAvgCexBid: 0, weightedAvgCexAsk: 0, weightedAvgCexSpreadPct: 0, weightedAvgCexSymbol: '', weightedAvgCexLatency: 0, dexPrice: 0, isReversed: false, signal: { shouldSwapOnDex: false, dexBid: 0, cexMidThreshold: 0, diffPct: 0, reason: 'Early exit' },
//       simulation: noSimulation,
//       realSwap: noRealSwap,
//     };
//   }
//
//   // ── 5. Определяем CEX-пару и запускаем DEX + CEX параллельно ──
//   const filteredTIn  = filtered[0].pair.tokenIn.address.toLowerCase();
//   const filteredTOut = filtered[0].pair.tokenOut.address.toLowerCase();
//   const firstPairKey = `${filteredTIn}|${filteredTOut}`;
//   const reversePairKey = `${filteredTOut}|${filteredTIn}`;
//   const cexSymbols = CEX_PAIR_MAP[firstPairKey] ?? CEX_PAIR_MAP[reversePairKey] ?? null;
//
//   const rawSteps: StoreSwapStep[] = filtered.map(f => poolConfigToStoreStep(f.pair as any));
//
//   // Параллельно: DEX quoteBuysDirect + CEX котировки
//   const cexPromises: Promise<{ name: string; quote: any } | null>[] = [];
//   if (cexSymbols?.binance) {
//     cexPromises.push(
//       getBinanceQuote(cexSymbols.binance).then(q => ({ name: 'Binance', quote: q })).catch(() => null),
//     );
//   }
//   if (cexSymbols?.mexc) {
//     cexPromises.push(
//       getMexcQuote(cexSymbols.mexc).then(q => ({ name: 'MEXC', quote: q })).catch(() => null),
//     );
//   }
//   if (cexSymbols?.bybit) {
//     cexPromises.push(
//       getBybitQuote(cexSymbols.bybit).then(q => ({ name: 'Bybit', quote: q })).catch(() => null),
//     );
//   }
//
//
//   let buyResult: any;
//   let cexResults: ({ name: string; quote: any } | null)[];
//   try {
//     [buyResult, ...cexResults] = await Promise.all([
//       reader.quoteBuysDirect.staticCall(rawSteps, amountIn),
//       ...cexPromises,
//     ]);
//   } catch (err: any) {
//     return {
//       ok: false, latencyMs: Math.round(performance.now() - totalStart), blockNumber: 0,
//       error: `quoteBuysDirect failed: ${err.message}`,
//       executorAddress, ethBalance: balanceResult.ethBal.toString(), tokens: balanceResult.tokens,
//       sellToken: {
//         address: tokenWithBalance.address, symbol: tokenWithBalance.symbol,
//         decimals: tokenWithBalance.decimals, balance: tokenWithBalance.rawBalance,
//         formatted: tokenWithBalance.formatted,
//       },
//       filteredPairsCount: filtered.length, bestQuote: null, allQuotes: [], cexQuotes: [],
//       weightedAvgCexMid: 0, weightedAvgCexBid: 0, weightedAvgCexAsk: 0, weightedAvgCexSpreadPct: 0, weightedAvgCexSymbol: '', weightedAvgCexLatency: 0, dexPrice: 0, isReversed: false, signal: { shouldSwapOnDex: false, dexBid: 0, cexMidThreshold: 0, diffPct: 0, reason: 'Early exit' },
//       simulation: noSimulation,
//       realSwap: noRealSwap,
//     };
//   }
//
//   // Собираем CEX-котировки
//   const cexQuotes: CexQuote[] = cexResults
//     .filter((r): r is { name: string; quote: any } => r !== null)
//     .map(r => toCexQuote(r.name, r.quote));
//
//   // Средневзвешенные CEX показатели
//   const totalWeight = cexQuotes.reduce((s, c) => s + (CEX_WEIGHT[c.name] ?? 1), 0);
//   const weightedAvgCexMid = totalWeight > 0
//     ? cexQuotes.reduce((s, c) => s + c.midPrice * (CEX_WEIGHT[c.name] ?? 1), 0) / totalWeight
//     : 0;
//   const weightedAvgCexBid = totalWeight > 0
//     ? cexQuotes.reduce((s, c) => s + c.bidPrice * (CEX_WEIGHT[c.name] ?? 1), 0) / totalWeight
//     : 0;
//   const weightedAvgCexAsk = totalWeight > 0
//     ? cexQuotes.reduce((s, c) => s + c.askPrice * (CEX_WEIGHT[c.name] ?? 1), 0) / totalWeight
//     : 0;
//   const weightedAvgCexSpreadPct = weightedAvgCexMid > 0
//     ? ((weightedAvgCexAsk - weightedAvgCexBid) / weightedAvgCexMid) * 100
//     : 0;
//   const weightedAvgCexSymbol = cexQuotes.length > 0 ? cexQuotes[0].symbol : '';
//   const weightedAvgCexLatency = cexQuotes.length > 0
//     ? Math.round(cexQuotes.reduce((s, c) => s + c.latencyMs * (CEX_WEIGHT[c.name] ?? 1), 0) / totalWeight)
//     : 0;
//
//   const { quotes, blockNumber } = buyResult;
//
//   if (consoleOutput && filtered.some(f => f.reversed)) {
//     console.log(`  ↔️  Направление развёрнуто: ${tokenWithBalance.symbol} на контракте, конфиги перевёрнуты`);
//   }
//
//   // ── 6. Маппинг результатов и поиск лучшей цены ──
//   const tokenOutDecimals = filtered[0].pair.tokenOut.decimals;
//   const tokenOutSymbol = resolveSymbol(filtered[0].pair.tokenOut);
//
//   const allQuotes: BestSellQuoteResult['allQuotes'] = [];
//   let bestIdx = -1;
//   let bestAmountOut = 0n;
//
//   for (let i = 0; i < quotes.length; i++) {
//     const q = quotes[i];
//
//     const f = filtered[i];
//     const amtOut = q.success ? (q.amountOut as bigint) : 0n;
//
//     allQuotes.push({
//       poolIndex: f.originalIndex,
//       dex: f.pair.dex,
//       version: f.pair.version,
//       poolAddress: f.pair.poolAddress,
//       amountOut: amtOut.toString(),
//       amountOutFormatted: ethers.formatUnits(amtOut, tokenOutDecimals),
//       success: q.success,
//       gasUsed: q.gasUsed?.toString() ?? '0',
//     });
//
//     if (q.success && amtOut > bestAmountOut) {
//       bestAmountOut = amtOut;
//       bestIdx = i;
//     }
//   }
//
//   const bestQuote: BestSellQuoteResult['bestQuote'] = bestIdx >= 0
//     ? {
//         poolIndex: filtered[bestIdx].originalIndex,
//         dex: filtered[bestIdx].pair.dex,
//         version: filtered[bestIdx].pair.version,
//         poolAddress: filtered[bestIdx].pair.poolAddress,
//         amountIn: amountIn.toString(),
//         amountOut: bestAmountOut.toString(),
//         amountOutFormatted: ethers.formatUnits(bestAmountOut, tokenOutDecimals),
//         tokenOutDecimals,
//         tokenOutSymbol,
//         gasUsed: allQuotes[bestIdx].gasUsed,
//       }
//     : null;
//
//   // DEX цена за 1 tokenIn из лучшего пула (raw: tokenOut / tokenIn)
//   const dexPriceRaw = bestQuote
//     ? Number(bestAmountOut) / (10 ** tokenOutDecimals) / (Number(amountIn) / (10 ** tokenWithBalance.decimals))
//     : 0;
//
//   // Если пара развёрнута (продаём стейблкоин за ETH), инвертируем цену
//   // чтобы dexPrice был в тех же единицах, что CEX (цена ETH в USDC)
//   const isReversed = filtered.some(f => f.reversed);
//   const dexPrice = isReversed && dexPriceRaw > 0 ? 1 / dexPriceRaw : dexPriceRaw;
//
//   // ── Сигнал ──
//   // Прямое (WETH→USDC): dexPrice = bid (цена продажи ETH на DEX).
//   //   Сигнал ПРОДАТЬ: DEX bid > CEX mid + порог → на DEX дороже → выгодно продать WETH.
//   // Обратное (USDC→WETH): dexPrice = ask (цена покупки ETH на DEX, инвертированная).
//   //   Сигнал КУПИТЬ: DEX ask < CEX mid - порог → на DEX дешевле → выгодно купить ETH.
//   const thresholdPct = getThresholdPct(sellTokenAddr);
//   const diffPct = weightedAvgCexMid > 0
//     ? ((dexPrice - weightedAvgCexMid) / weightedAvgCexMid) * 100
//     : 0;
//
//   const priceLabel = isReversed ? 'DEX ask' : 'DEX bid';
//
//   // Порог: для reversed — cexMid * (1 - порог), для прямого — cexMid * (1 + порог)
//   const cexMidThreshold = isReversed
//     ? weightedAvgCexMid * (1 - thresholdPct / 100)   // покупаем ETH: DEX ask < этого → сигнал
//     : weightedAvgCexMid * (1 + thresholdPct / 100);  // продаём ETH: DEX bid > этого → сигнал
//
//   // Условие сигнала зависит от направления
//   const shouldSwap = isReversed
//     ? dexPrice < cexMidThreshold   // reversed: DEX ask ниже порога → ETH дешевле на DEX → покупаем
//     : dexPrice > cexMidThreshold;  // прямое: DEX bid выше порога → ETH дороже на DEX → продаём
//
//   let signal: BestSellQuoteResult['signal'];
//   if (!bestQuote) {
//     signal = { shouldSwapOnDex: false, dexBid: 0, cexMidThreshold, diffPct: 0, reason: 'Нет DEX-котировки' };
//   } else if (cexQuotes.length === 0) {
//     signal = { shouldSwapOnDex: false, dexBid: dexPrice, cexMidThreshold: 0, diffPct: 0, reason: 'Нет CEX-котировок для сравнения' };
//   } else if (shouldSwap) {
//     const thresholdOp = isReversed ? '-' : '+';
//     signal = {
//       shouldSwapOnDex: true, dexBid: dexPrice, cexMidThreshold, diffPct,
//       reason: `${priceLabel} $${dexPrice.toFixed(2)} ${isReversed ? '<' : '>'} W-AVG CEX mid $${weightedAvgCexMid.toFixed(2)} ${thresholdOp} ${thresholdPct}% ($${cexMidThreshold.toFixed(2)}) → ${isReversed ? 'ETH дешевле на DEX, покупаем' : 'ETH дороже на DEX, продаём'}`,
//     };
//   } else {
//     const thresholdOp = isReversed ? '-' : '+';
//     signal = {
//       shouldSwapOnDex: false, dexBid: dexPrice, cexMidThreshold, diffPct,
//       reason: `${priceLabel} $${dexPrice.toFixed(2)} ${isReversed ? '>=' : '<='} W-AVG CEX mid $${weightedAvgCexMid.toFixed(2)} ${thresholdOp} ${thresholdPct}% ($${cexMidThreshold.toFixed(2)}) → ${isReversed ? 'ETH ещё не подешевел на DEX' : 'ETH ещё не подорожал на DEX'}`,
//     };
//   }
//
//   // ── 8. Симуляция свопа (если есть сигнал) ──
//   let simulation: BestSellQuoteResult['simulation'] = noSimulation;
//
//   if (signal.shouldSwapOnDex && bestQuote && bestIdx >= 0) {
//     const bestPair = filtered[bestIdx].pair;
//     const isV2 = bestPair.version === 'v2';
//
//     // amountOutMin = bestAmountOut * (10000 - slippageBps) / 10000
//     const amountOutMin = applySlippagePpm(bestAmountOut, SWAP_SLIPPAGE_PPM);
//
//     const swapStep: IContractStep = {
//       kind: resolveSwapKind(bestPair.dex, bestPair.version),
//       router: (isV2 ? V2_ROUTERS[bestPair.dex] ?? ZERO_ADDRESS : ZERO_ADDRESS) as Address,
//       path:   isV2 ? [bestPair.tokenIn.address, bestPair.tokenOut.address] : [],
//       pool:   (!isV2 && bestPair.poolAddress ? bestPair.poolAddress : ZERO_ADDRESS) as Address,
//       tokenIn:  bestPair.tokenIn.address as Address,
//       tokenOut: bestPair.tokenOut.address as Address,
//       amountIn,
//       amountOutMin,
//       sqrtPriceLimitX96: 0,
//       deadline: 0,
//     };
//
//     const profitToken = bestPair.tokenOut.address;
//     const simStart = performance.now();
//
//     try {
//       const [simSummary, simLogs] = await executor.executeSwaps.staticCall(
//         [swapStep],
//         profitToken,
//         false,   // revertIfLoss
//         false,   // emitEvents
//       );
//
//       const simMs = Math.round(performance.now() - simStart);
//       const simAmountOut: bigint = simLogs[0][6];
//       const simGas: bigint = simLogs[0][7];
//       const simBlock = Number(simSummary[0]);
//
//       const simAmountOutFormatted = ethers.formatUnits(simAmountOut, tokenOutDecimals);
//       const simPriceRaw = Number(simAmountOut) / (10 ** tokenOutDecimals) / (Number(amountIn) / (10 ** tokenWithBalance.decimals));
//       const simPricePerToken = isReversed && simPriceRaw > 0 ? 1 / simPriceRaw : simPriceRaw;
//
//       simulation = {
//         executed: true,
//         ok: true,
//         latencyMs: simMs,
//         swapStep,
//         amountIn: amountIn.toString(),
//         amountOut: simAmountOut.toString(),
//         amountOutFormatted: simAmountOutFormatted,
//         amountOutMin: amountOutMin.toString(),
//         amountOutMinFormatted: ethers.formatUnits(amountOutMin, tokenOutDecimals),
//         slippageBps: Number(SWAP_SLIPPAGE_PPM) / 100,  // PPM → bps для обратной совместимости
//         gasUsed: simGas.toString(),
//         blockNumber: simBlock,
//         pricePerToken: simPricePerToken,
//       };
//
//       if (consoleOutput) {
//         console.log(`\n  ${'─'.repeat(60)}`);
//         console.log(`  🧪 Симуляция свопа (${bestQuote.dex}-${bestQuote.version} [${bestQuote.poolIndex}]):`);
//         console.log(`     ✅ OK (${simMs} ms)`);
//         console.log(`     block: ${simBlock}, gas: ${simGas}`);
//         console.log(`     amountIn:     ${tokenWithBalance.formatted} ${tokenWithBalance.symbol}`);
//         console.log(`     amountOut:    ${simAmountOutFormatted} ${tokenOutSymbol}`);
//         console.log(`     amountOutMin: ${ethers.formatUnits(amountOutMin, tokenOutDecimals)} ${tokenOutSymbol} (slippage: ${Number(SWAP_SLIPPAGE_PPM) / 10000}%)`);
//         const priceLabel = isReversed ? tokenOutSymbol : tokenWithBalance.symbol;
//         console.log(`     💰 Цена: 1 ${priceLabel} = $${simPricePerToken.toFixed(2)}`);
//       }
//     } catch (err: any) {
//       const simMs = Math.round(performance.now() - simStart);
//       const reason = err?.reason ?? err?.shortMessage ?? err?.message ?? 'Unknown error';
//
//       simulation = {
//         executed: true,
//         ok: false,
//         latencyMs: simMs,
//         error: reason,
//         swapStep,
//         amountIn: amountIn.toString(),
//         amountOutMin: amountOutMin.toString(),
//         amountOutMinFormatted: ethers.formatUnits(amountOutMin, tokenOutDecimals),
//         slippageBps: Number(SWAP_SLIPPAGE_PPM) / 100,
//       };
//
//       if (consoleOutput) {
//         console.log(`\n  ${'─'.repeat(60)}`);
//         console.log(`  🧪 Симуляция свопа (${bestQuote.dex}-${bestQuote.version} [${bestQuote.poolIndex}]):`);
//         console.log(`     ❌ FAILED (${simMs} ms): ${reason}`);
//       }
//     }
//   } else if (consoleOutput && !signal.shouldSwapOnDex) {
//     console.log(`\n  ⏸️  Симуляция не запущена (нет сигнала)`);
//   }
//
//   // ── 9. Реальный своп (если executeReal=true и симуляция OK) ──
//   let realSwap: BestSellQuoteResult['realSwap'] = noRealSwap;
//
//   if (simulation.executed && simulation.ok && executeReal && simulation.swapStep) {
//     const swapStep = simulation.swapStep;
//     const profitToken = swapStep.tokenOut;
//
//     console.log('swapStep', swapStep);
//     console.log('profitToken', profitToken);
//
//     if (consoleOutput) {
//       console.log(`\n  ${'─'.repeat(60)}`);
//       console.log(`  🚀 Отправка реального свопа (maxFee=${maxFeePerGasGwei} gwei, priority=${maxPriorityFeePerGasGwei} gwei)...`);
//     }
//
//     const txStart = performance.now();
//     let sentTx: any = null;
//     let sentTxData: string | null = null;
//
//     try {
//       sentTx = await executor.executeSwaps(
//         [swapStep],
//         profitToken,
//         false,   // revertIfLoss — для одностороннего свопа нет понятия "убыток"
//         true,    // emitEvents
//         {
//           gasLimit: 1_200_000n,
//           maxFeePerGas: ethers.parseUnits(maxFeePerGasGwei.toString(), 'gwei'),
//           maxPriorityFeePerGas: ethers.parseUnits(maxPriorityFeePerGasGwei.toString(), 'gwei'),
//         },
//       );
//       sentTxData = sentTx.data;
//
//       if (consoleOutput) console.log(`     📤 TX sent: ${sentTx.hash}`);
//
//       const receipt = await sentTx.wait();
//       const txMs = Math.round(performance.now() - txStart);
//
//       if (receipt.status === 0) {
//         // TX revert on-chain — replay для причины
//         let revertReason: any = null;
//         try {
//           await provider.call({
//             to: receipt.to,
//             from: receipt.from,
//             data: sentTxData,
//             blockTag: receipt.blockNumber,
//           });
//         } catch (replayErr: any) {
//           revertReason = decodeRevert(replayErr);
//         }
//
//         realSwap = {
//           executed: true,
//           ok: false,
//           skipped: false,
//           latencyMs: txMs,
//           txHash: sentTx.hash,
//           blockNumber: Number(receipt.blockNumber),
//           gasUsed: receipt.gasUsed?.toString(),
//           error: revertReason?.name ?? revertReason?.message ?? 'TX reverted on-chain',
//         };
//
//         if (consoleOutput) {
//           console.log(`     ❌ TX REVERTED (${txMs} ms)`);
//           console.log(`        txHash: ${sentTx.hash}`);
//           console.log(`        block: ${receipt.blockNumber}, gas: ${receipt.gasUsed}`);
//           console.log(`        reason: ${JSON.stringify(revertReason)}`);
//         }
//       } else {
//         // Успех — парсим логи для amountOut
//         let txAmountOut: string | undefined;
//         let txAmountOutFormatted: string | undefined;
//         try {
//           const iface = new Interface(ArbExecutorAbi.abi);
//           for (const log of receipt.logs) {
//             try {
//               const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
//               if (parsed && parsed.name === 'SwapExecuted') {
//                 txAmountOut = parsed.args.amountOut?.toString();
//                 if (txAmountOut) {
//                   txAmountOutFormatted = ethers.formatUnits(BigInt(txAmountOut), tokenOutDecimals);
//                 }
//               }
//             } catch { /* skip non-matching logs */ }
//           }
//         } catch { /* ignore parse errors */ }
//
//         realSwap = {
//           executed: true,
//           ok: true,
//           skipped: false,
//           latencyMs: txMs,
//           txHash: sentTx.hash,
//           blockNumber: Number(receipt.blockNumber),
//           gasUsed: receipt.gasUsed?.toString(),
//           amountOut: txAmountOut,
//           amountOutFormatted: txAmountOutFormatted,
//         };
//
//         if (consoleOutput) {
//           console.log(`     ✅ TX SUCCESS (${txMs} ms)`);
//           console.log(`        txHash: ${sentTx.hash}`);
//           console.log(`        block: ${receipt.blockNumber}, gas: ${receipt.gasUsed}`);
//           if (txAmountOutFormatted) {
//             console.log(`        amountOut: ${txAmountOutFormatted} ${tokenOutSymbol}`);
//           }
//         }
//       }
//     } catch (e: any) {
//       const txMs = Math.round(performance.now() - txStart);
//       const txHash = sentTx?.hash ?? e.transaction?.hash ?? null;
//       const decoded = decodeRevert(e);
//
//       // Replay для получения причины revert
//       let replayDecoded: any = null;
//       const replayData = sentTxData ?? e.transaction?.data;
//       const receiptBlock = e.receipt?.blockNumber;
//
//       if (decoded.type === 'UNKNOWN' && receiptBlock && replayData) {
//         try {
//           await provider.call({
//             to: e.receipt?.to ?? executorAddress,
//             from: e.receipt?.from ?? wallet.address,
//             data: replayData,
//             blockTag: receiptBlock,
//           });
//         } catch (replayErr: any) {
//           replayDecoded = decodeRevert(replayErr);
//         }
//       }
//
//       const finalError = replayDecoded ?? decoded;
//
//       realSwap = {
//         executed: true,
//         ok: false,
//         skipped: false,
//         latencyMs: txMs,
//         txHash: txHash ?? undefined,
//         error: finalError.name ?? finalError.message ?? JSON.stringify(finalError),
//       };
//
//       if (consoleOutput) {
//         console.log(`     ❌ TX FAILED (${txMs} ms): ${finalError.name ?? finalError.message}`);
//         if (txHash) console.log(`        txHash: ${txHash}`);
//         console.log(`        error: ${JSON.stringify(finalError)}`);
//       }
//     }
//   } else if (simulation.executed && simulation.ok && !executeReal) {
//     realSwap = { executed: false, ok: false, skipped: true, reason: 'executeReal=false', latencyMs: 0 };
//     if (consoleOutput) {
//       console.log(`\n  ⏸️  Реальный своп не отправлен (executeReal=false)`);
//     }
//   } else if (simulation.executed && !simulation.ok) {
//     realSwap = { executed: false, ok: false, skipped: true, reason: 'simulation failed', latencyMs: 0 };
//     if (consoleOutput) {
//       console.log(`\n  ⏸️  Реальный своп не отправлен (симуляция провалилась)`);
//     }
//   }
//
//   const totalMs = performance.now() - totalStart;
//
//   // ── 7. Вывод в консоль ──
//   if (consoleOutput) {
//     console.log(`\n${'═'.repeat(65)}`);
//     console.log('  📊 getBestSellQuote — лучшая цена продажи токена с контракта');
//     console.log(`${'═'.repeat(65)}`);
//     console.log(`  Контракт:      ${executorAddress}`);
//     console.log(`  ETH баланс:    ${ethers.formatEther(balanceResult.ethBal)} ETH`);
//     console.log(`  Токены на контракте:`);
//     for (const t of balanceResult.tokens) {
//       const mark = t.address.toLowerCase() === sellTokenAddr ? ' ◀ продаём' : '';
//       console.log(`    ${t.symbol.padEnd(8)} ${t.formatted.padStart(22)}${mark}`);
//     }
//
//     console.log(`\n  Продаём:       ${tokenWithBalance.formatted} ${tokenWithBalance.symbol} (${tokenWithBalance.address})`);
//     console.log(`  Пулов (фильтр): ${filtered.length} из ${pairsToQuote.length}`);
//     console.log(`  Block:         ${blockNumber}`);
//     console.log(`  Latency:       ${totalMs.toFixed(0)} ms`);
//
//     console.log(`\n  ${'─'.repeat(60)}`);
//     console.log('  Котировки (все пулы):');
//     for (const q of allQuotes) {
//       const mark = bestQuote && q.poolIndex === bestQuote.poolIndex ? ' ⭐ BEST' : '';
//       const status = q.success ? '✅' : '❌';
//       console.log(`    [${q.poolIndex}] ${q.dex}-${q.version} ${status} → ${q.amountOutFormatted} ${tokenOutSymbol} (gas: ${q.gasUsed})${mark}`);
//     }
//
//     if (bestQuote) {
//       const priceRaw = Number(bestAmountOut) / (10 ** tokenOutDecimals) / (Number(amountIn) / (10 ** tokenWithBalance.decimals));
//       const priceDisplay = isReversed && priceRaw > 0 ? 1 / priceRaw : priceRaw;
//       const priceBaseSymbol = isReversed ? tokenOutSymbol : tokenWithBalance.symbol;
//       const priceQuoteSymbol = isReversed ? tokenWithBalance.symbol : tokenOutSymbol;
//       console.log(`\n  🏆 Лучшая цена DEX: [${bestQuote.poolIndex}] ${bestQuote.dex}-${bestQuote.version}`);
//       console.log(`     ${tokenWithBalance.formatted} ${tokenWithBalance.symbol} → ${bestQuote.amountOutFormatted} ${tokenOutSymbol}`);
//       console.log(`     Цена: 1 ${priceBaseSymbol} = ${priceDisplay.toFixed(2)} ${priceQuoteSymbol}`);
//     } else {
//       console.log('\n  ❌ Все DEX-котировки провалились');
//     }
//
//     // CEX котировки + DEX цена
//     if (cexQuotes.length > 0 || bestQuote) {
//       console.log(`\n  ${'─'.repeat(60)}`);
//       console.log('  Котировки (DEX + CEX):');
//       if (bestQuote) {
//         const dexPriceLabel = isReversed ? 'ask' : 'bid';
//         console.log(`    ${'DEX'.padEnd(10)} ${bestQuote.dex}-${bestQuote.version} [${bestQuote.poolIndex}]  ${dexPriceLabel}: $${dexPrice.toFixed(2)}  (${tokenWithBalance.formatted} ${tokenWithBalance.symbol} → ${bestQuote.amountOutFormatted} ${tokenOutSymbol})`);
//       }
//       for (const cex of cexQuotes) {
//         console.log(`    ${cex.name.padEnd(10)} ${cex.symbol}  bid: $${cex.bidPrice.toFixed(2)}  ask: $${cex.askPrice.toFixed(2)}  mid: $${cex.midPrice.toFixed(2)}  spread: ${cex.spreadPct.toFixed(4)}%  w: ${CEX_WEIGHT[cex.name] ?? 1}  (${cex.latencyMs} ms)`);
//       }
//       if (cexQuotes.length > 0) {
//         console.log(`    ${'W-AVG CEX'.padEnd(10)} ${weightedAvgCexSymbol}  bid: $${weightedAvgCexBid.toFixed(2)}  ask: $${weightedAvgCexAsk.toFixed(2)}  mid: $${weightedAvgCexMid.toFixed(2)}  spread: ${weightedAvgCexSpreadPct.toFixed(4)}%  (${weightedAvgCexLatency} ms)`);
//       }
//     } else {
//       console.log(`\n  ⚠️ Нет котировок`);
//     }
//
//     // Сигнал
//     console.log(`\n  ${'─'.repeat(60)}`);
//     if (signal.shouldSwapOnDex) {
//       const action = isReversed ? 'КУПИТЬ ETH НА DEX' : 'ПРОДАТЬ ETH НА DEX';
//       console.log(`  🟢 СИГНАЛ: ${action}  (diff: ${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(4)}%)`);
//     } else {
//       console.log(`  🔴 НЕТ СИГНАЛА  (diff: ${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(4)}%)`);
//     }
//     console.log(`     ${signal.reason}`);
//     if (weightedAvgCexMid > 0 && dexPrice > 0) {
//       const pl = isReversed ? 'DEX ask' : 'DEX bid';
//       const thresholdOp = isReversed ? '-' : '+';
//       console.log(`     ${pl}: $${dexPrice.toFixed(2)}  |  CEX mid${thresholdOp}${thresholdPct}%: $${cexMidThreshold.toFixed(2)}  |  diff: ${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(4)}%`);
//     }
//
//     // Симуляция свопа
//     if (simulation.executed) {
//       console.log(`\n  ${'─'.repeat(60)}`);
//       console.log(`  Симуляция свопа:`);
//       console.log(`     ${simulation.ok ? '✅ Успешно' : '❌ Ошибка'} (${simulation.latencyMs} ms)`);
//       if (simulation.error) {
//         console.log(`     Ошибка: ${simulation.error}`);
//       } else if (simulation.swapStep) {
//         console.log(`     Параметры свопа:`);
//         console.log(`       ${simulation.swapStep.kind} на ${simulation.swapStep.router}`);
//         console.log(`       tokenIn:  ${simulation.swapStep.tokenIn}`);
//         console.log(`       tokenOut: ${simulation.swapStep.tokenOut}`);
//         console.log(`       amountIn: ${simulation.amountIn}`);
//         console.log(`       amountOut: ${simulation.amountOut} (min: ${simulation.amountOutMin})`);
//         console.log(`       gas: ${simulation.gasUsed}`);
//         console.log(`       block: ${simulation.blockNumber}`);
//         const simPriceLabel = isReversed ? tokenOutSymbol : tokenWithBalance.symbol;
//         console.log(`       цена: 1 ${simPriceLabel} = $${simulation.pricePerToken?.toFixed(2)}`);
//       }
//     }
//
//     // Реальный своп
//     if (realSwap.executed) {
//       console.log(`\n  ${'─'.repeat(60)}`);
//       console.log(`  💰 Реальный своп:`);
//       console.log(`     ${realSwap.ok ? '✅ Успешно' : '❌ Ошибка'} (${realSwap.latencyMs} ms)`);
//       if (realSwap.txHash) console.log(`     txHash: ${realSwap.txHash}`);
//       if (realSwap.blockNumber) console.log(`     block: ${realSwap.blockNumber}`);
//       if (realSwap.gasUsed) console.log(`     gas: ${realSwap.gasUsed}`);
//       if (realSwap.amountOutFormatted) console.log(`     amountOut: ${realSwap.amountOutFormatted} ${tokenOutSymbol}`);
//       if (realSwap.error) console.log(`     error: ${realSwap.error}`);
//     } else if (realSwap.skipped) {
//       console.log(`\n  ⏸️  Реальный своп: ${realSwap.reason}`);
//     }
//   }
//
//   return {
//     ok: bestQuote !== null,
//     latencyMs: Math.round(totalMs),
//     blockNumber: Number(blockNumber),
//     executorAddress,
//     ethBalance: balanceResult.ethBal.toString(),
//     tokens: balanceResult.tokens,
//     sellToken: {
//       address: tokenWithBalance.address, symbol: tokenWithBalance.symbol,
//       decimals: tokenWithBalance.decimals, balance: tokenWithBalance.rawBalance,
//       formatted: tokenWithBalance.formatted,
//     },
//     filteredPairsCount: filtered.length,
//     bestQuote,
//     allQuotes,
//     cexQuotes,
//     weightedAvgCexMid,
//     weightedAvgCexBid,
//     weightedAvgCexAsk,
//     weightedAvgCexSpreadPct,
//     weightedAvgCexSymbol,
//     weightedAvgCexLatency,
//     dexPrice,
//     isReversed,
//     signal,
//     simulation,
//     realSwap,
//   };
// }
//
//
//
