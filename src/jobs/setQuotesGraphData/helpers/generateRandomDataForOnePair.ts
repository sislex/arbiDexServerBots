const lastPrices: Map<number, bigint> = new Map();

export const generateSingleMockQuote = (t0Id: number, t1Id: number): any => {
  const decimals18 = BigInt(10) ** BigInt(18);

  const getPriceForToken = (id: number) => {
    let currentBase = lastPrices.get(id);

    // Если цены нет в кэше, создаем базовую
    if (!currentBase) {
      currentBase = BigInt(Math.floor(Math.random() * 1000) + 1) * decimals18;
    }

    // Рандомное изменение цены (от -1% до +1%)
    const percentage = BigInt(Math.floor(Math.random() * 201) + 9900);
    const newPrice = (currentBase * percentage) / 10000n;

    lastPrices.set(id, newPrice);
    return newPrice;
  };

  const price = getPriceForToken(t0Id);

  return {
    chainId: 1,
    token0Id: t0Id,
    token1Id: t1Id,
    costBuy: price,
    costSell: (price * 99n) / 100n, // Спред 1%
    timestamp: new Date(),
  };
};
