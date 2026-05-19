export type ImpactArbSummary = {
  bestBuyRows: Array<Record<string, string>>;
  bestSellRows: Array<Record<string, string>>;
  arbLines: string[];
};

export function printImpactQuoteResults(
  table: Array<Record<string, string | boolean>>,
  arbSummary: ImpactArbSummary,
  successCount: number,
  callsCount: number,
): void {
  console.table(table);

  console.log('\nBest buy price:');
  console.table(arbSummary.bestBuyRows);
  console.log('\nBest sell price:');
  console.table(arbSummary.bestSellRows);
  console.log('\nCross-pool arbitrage:');
  for (const line of arbSummary.arbLines) {
    console.log(line);
  }

  console.log(`Success: ${successCount}/${callsCount}`);
}

