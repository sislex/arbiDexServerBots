import { generateMockQuotes } from './helpers/generateGraphData';
import { runWithContext } from '../getPoolsFromFactory/utils/run-with-context';
import { initServices } from '../getPoolsFromFactory/utils/init-services';
import { setQuotesData } from './setQuotesGraphData';

export async function setQuotesGraphData(deps: {
  jobType: string;
  rpcUrl: string;
  pairsToQuote: any;
  extraSettings?: string;
}) {
  const result = generateMockQuotes();

  return runWithContext(
    deps.extraSettings,
    initServices,
    async ({ manager, services }) => {
      await setQuotesData(result, services.quotesGraph, manager);

      return { success: true, count: result.length };
    },
  );
}
