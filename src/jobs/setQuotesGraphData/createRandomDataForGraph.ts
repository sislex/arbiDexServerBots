import { runWithContext } from '../getPoolsFromFactory/utils/run-with-context';
import { initServices } from '../getPoolsFromFactory/utils/init-services';
import { setQuotesData } from './setQuotesGraphData';
import { quoteEvents } from './helpers/events';
import { IJobType, IPool } from '../../store/state.types';
import { getDexQuotesByArbQuoter } from '../getDexQuotesByArbQuoter/getDexQuotesByArbQuoter';

export async function setQuotesGraphData(deps: {
  jobType: string;
  rpcUrl: string;
  pairsToQuote: IPool[];
  extraSettings?: string;
}) {
  const { extraSettings, pairsToQuote, rpcUrl } = deps;

  const config = typeof extraSettings === 'string' ? JSON.parse(extraSettings) : extraSettings;
  const pair = config?.configData?.pair;

  const poolsToQuote = pairsToQuote.map(pool => ({
    dex: pool.dex,
    version: pool.version,
    poolAddress: pool.poolAddress,
    token0: pool.token0,
    token1: pool.token1,
    feePpm: pool.feePpm,
  }));

  const result = await getDexQuotesByArbQuoter({
    jobType: IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
    source: '',
    rpcUrl: rpcUrl,
    pairsToQuote: poolsToQuote,
  });

 const sendResult = {
   chainId: 1,
   token0Id: poolsToQuote[0].token0,
   token1Id: poolsToQuote[0].token1,
   costBuy: result.bestBuyPrice,
   costSell: result.bestSellPrice,
   timestamp: new Date(),
 }

  // console.log(sendResult); //ЛОГИ

  quoteEvents.emit('quotes_updated', [sendResult]);

  // return runWithContext(
  //   extraSettings,
  //   initServices,
  //   async ({ manager, services }) => {
  //     // 4. Сохраняем реальные данные в базу/граф
  //     await setQuotesData(result, services.quotesGraph, manager);
  //
  //     return { success: true };
  //   },
  // );
}
