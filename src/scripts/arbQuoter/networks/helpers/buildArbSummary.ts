export type ArbSummaryCandidate = {
  amountIn: string;
  dex: string;
  version: string;
  pool: string;
  sellPriceOutPerIn: number;
  buyPriceOutPerIn: number;
};

function formatNumberFixed(value: number, precision = 6): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (value === 0) return '0';
  if (Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toFixed(precision);
}

function formatPercent(value: number, precision = 4): string {
  if (!Number.isFinite(value)) return 'n/a';
  return `${value.toFixed(precision)}%`;
}

export function buildArbSummary(candidates: ArbSummaryCandidate[]) {
  const byAmountIn = new Map<string, ArbSummaryCandidate[]>();

  for (const candidate of candidates) {
    const rows = byAmountIn.get(candidate.amountIn) ?? [];
    rows.push(candidate);
    byAmountIn.set(candidate.amountIn, rows);
  }

  const bestBuyRows: Array<Record<string, string>> = [];
  const bestSellRows: Array<Record<string, string>> = [];
  const arbLines: string[] = [];

  for (const [amountIn, rows] of byAmountIn.entries()) {
    const validRows = rows.filter((row) =>
      Number.isFinite(row.sellPriceOutPerIn)
      && Number.isFinite(row.buyPriceOutPerIn)
      && row.sellPriceOutPerIn > 0
      && row.buyPriceOutPerIn > 0,
    );

    if (!validRows.length) {
      bestBuyRows.push({
        amountIn,
        bestBuyPriceOutPerIn: 'n/a',
        dex: 'n/a',
        version: 'n/a',
        pool: 'n/a',
      });
      bestSellRows.push({
        amountIn,
        bestSellPriceOutPerIn: 'n/a',
        dex: 'n/a',
        version: 'n/a',
        pool: 'n/a',
      });
      arbLines.push(`${amountIn}: no valid quotes for arbitrage check`);
      continue;
    }

    const bestBuy = validRows.reduce((best, row) =>
      row.buyPriceOutPerIn < best.buyPriceOutPerIn ? row : best,
    );

    const bestSell = validRows.reduce((best, row) =>
      row.sellPriceOutPerIn > best.sellPriceOutPerIn ? row : best,
    );

    const spread = bestSell.sellPriceOutPerIn - bestBuy.buyPriceOutPerIn;
    const canCrossPoolArb = bestSell.pool.toLowerCase() !== bestBuy.pool.toLowerCase() && spread > 0;
    const spreadPct = bestBuy.buyPriceOutPerIn > 0 ? (spread / bestBuy.buyPriceOutPerIn) * 100 : Number.NaN;

    bestBuyRows.push({
      amountIn,
      bestBuyPriceOutPerIn: formatNumberFixed(bestBuy.buyPriceOutPerIn),
      dex: bestBuy.dex,
      version: bestBuy.version,
      pool: bestBuy.pool,
    });
    bestSellRows.push({
      amountIn,
      bestSellPriceOutPerIn: formatNumberFixed(bestSell.sellPriceOutPerIn),
      dex: bestSell.dex,
      version: bestSell.version,
      pool: bestSell.pool,
    });

    arbLines.push(
      `${amountIn}: ${canCrossPoolArb ? 'ARB POSSIBLE' : 'NO ARB'} `
      + `(spread ${formatPercent(spreadPct)}; sell ${formatNumberFixed(bestSell.sellPriceOutPerIn)} - buy ${formatNumberFixed(bestBuy.buyPriceOutPerIn)})`,
    );
  }

  return { bestBuyRows, bestSellRows, arbLines };
}

