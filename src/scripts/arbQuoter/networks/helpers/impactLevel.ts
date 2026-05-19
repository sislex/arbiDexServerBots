export function impactLevel(priceImpactPpm: bigint): string {
  const ppm = Number(priceImpactPpm);

  if (ppm >= 100_000) return 'CRITICAL >10%';
  if (ppm >= 50_000) return 'VERY_HIGH <=10%';
  if (ppm >= 10_000) return 'HIGH <=5%';
  if (ppm >= 3_000) return 'MEDIUM <=1%';
  if (ppm >= 1_000) return 'LOW <=0.3%';

  return 'OK <0.1%';
}

