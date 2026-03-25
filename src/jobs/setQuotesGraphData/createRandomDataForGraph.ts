import { generateMockQuotes } from './helpers/generateGraphData';
import { runWithContext } from '../getPoolsFromFactory/utils/run-with-context';
import { initServices } from '../getPoolsFromFactory/utils/init-services';
import { setQuotesData } from './setQuotesGraphData';
import { quoteEvents } from './helpers/events';
import { generateSingleMockQuote } from './generateRandomDataForOnePair';

export async function setQuotesGraphData(deps: {
  jobType: string;
  rpcUrl: string;
  pairsToQuote: any;
  extraSettings?: string;
}) {
  const { extraSettings } = deps;

  const config = typeof extraSettings === 'string' ? JSON.parse(extraSettings) : extraSettings;
  const t0Id = config?.configData?.pair?.t0Id;
  const t1Id = config?.configData?.pair?.t1Id;

  if (t0Id === undefined || t1Id === undefined) {
    return { success: false, error: 'Missing token IDs' };
  }

  const result = generateSingleMockQuote(Number(t0Id), Number(t1Id));

  quoteEvents.emit('quotes_updated', [result]);

  return runWithContext(
    extraSettings,
    initServices,
    async ({ manager, services }) => {
      await setQuotesData([result], services.quotesGraph, manager);

      return { success: true };
    },
  );
}

