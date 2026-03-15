const lastPrices: Map<number, bigint> = new Map();

export const generateMockQuotes = (): any[] => {
  const decimals18 = BigInt(10) ** BigInt(18);

  // Генерируем 8 пар (от 2-10 до 9-17)
  return Array.from({ length: 8 }, (_, i) => {
    const t0Id = i + 2;
    const t1Id = i + 10;

    const getPriceForToken = (id: number) => {
      let currentBase = lastPrices.get(id);
      if (!currentBase) {
        currentBase = BigInt(Math.floor(Math.random() * 1000) + 1) * decimals18;
      }

      const percentage = BigInt(Math.floor(Math.random() * 201) + 9900);
      const newPrice = (currentBase * percentage) / 10000n;

      lastPrices.set(id, newPrice);
      return newPrice;
    };

    const price = getPriceForToken(t0Id);

    return {
      token0Id: t0Id,
      token1Id: t1Id,
      costBuy: price,
      costSell: (price * 99n) / 100n,
      timestamp: new Date(),
    };
  });
};
