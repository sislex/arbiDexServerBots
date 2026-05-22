export type ArbSummaryCandidate = {
  amountIn: string;
  amountOut: string;
  dex: string;
  version: string;
  pool: string;
  bestBuyPriceOutPerIn: number;
  bestSellPriceOutPerIn: number;
};

function formatNumberFixed(value: number, precision = 6): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0";
  if (Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toFixed(precision);
}

function formatPercent(value: number, precision = 4): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${value.toFixed(precision)}%`;
}

export function buildArbSummary(candidates: ArbSummaryCandidate[]) {
  const byAmount = new Map<string, ArbSummaryCandidate[]>();
  for (const candidate of candidates) {
    const key = `${candidate.amountIn} / ${candidate.amountOut}`;
    const rows = byAmount.get(key) ?? [];
    rows.push(candidate);
    byAmount.set(key, rows);
  }

  const bestBuyRows: Array<Record<string, string>> = [];
  const bestSellRows: Array<Record<string, string>> = [];
  const arbLines: string[] = [];

  for (const [amountKey, rows] of byAmount.entries()) {
    const validRows = rows.filter((row) =>
      Number.isFinite(row.bestBuyPriceOutPerIn)
      && Number.isFinite(row.bestSellPriceOutPerIn)
      && row.bestBuyPriceOutPerIn > 0
      && row.bestSellPriceOutPerIn > 0
    );

    if (!validRows.length) {
      bestBuyRows.push({ amount: amountKey, bestBuyPriceOutPerIn: "n/a", dex: "n/a", version: "n/a", pool: "n/a" });
      bestSellRows.push({ amount: amountKey, bestSellPriceOutPerIn: "n/a", dex: "n/a", version: "n/a", pool: "n/a" });
      arbLines.push(`${amountKey}: ❌ нельзя арбитражить (нет валидных buy/sell котировок)`);
      continue;
    }

    const bestBuy = validRows.reduce((best, row) => row.bestBuyPriceOutPerIn < best.bestBuyPriceOutPerIn ? row : best);
    const bestSell = validRows.reduce((best, row) => row.bestSellPriceOutPerIn > best.bestSellPriceOutPerIn ? row : best);

    const spread = bestSell.bestSellPriceOutPerIn - bestBuy.bestBuyPriceOutPerIn;
    const canCrossPoolArb = bestSell.pool.toLowerCase() !== bestBuy.pool.toLowerCase() && spread > 0;
    const spreadPct = bestBuy.bestBuyPriceOutPerIn > 0 ? (spread / bestBuy.bestBuyPriceOutPerIn) * 100 : NaN;

    bestBuyRows.push({
      amount: amountKey,
      bestBuyPriceOutPerIn: formatNumberFixed(bestBuy.bestBuyPriceOutPerIn),
      dex: bestBuy.dex,
      version: bestBuy.version,
      pool: bestBuy.pool,
    });
    bestSellRows.push({
      amount: amountKey,
      bestSellPriceOutPerIn: formatNumberFixed(bestSell.bestSellPriceOutPerIn),
      dex: bestSell.dex,
      version: bestSell.version,
      pool: bestSell.pool,
    });
    arbLines.push(
      `${amountKey}: ${canCrossPoolArb ? "✅ можно" : "❌ нельзя"} арбитражить между пулов `
      + `(spread ${formatPercent(spreadPct)}; sell ${formatNumberFixed(bestSell.bestSellPriceOutPerIn)} - buy ${formatNumberFixed(bestBuy.bestBuyPriceOutPerIn)})`
    );
  }

  return { bestBuyRows, bestSellRows, arbLines };
}

