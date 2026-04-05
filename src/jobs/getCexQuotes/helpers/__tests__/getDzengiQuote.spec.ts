/**
 * Unit-тесты для getDzengiQuote.
 * Мокаем global fetch — без реальных HTTP-вызовов.
 *
 * Author: Aliaksei Razhnou
 */

const originalFetch = global.fetch;

function mockFetch(responseBody: any, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Bad Request',
    json: async () => responseBody,
  }) as any;
}

import { getDzengiQuote } from '../getDzengiQuote';

describe('getDzengiQuote', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('should return parsed quote for valid response', async () => {
    mockFetch({
      symbol: 'ETH/USDT',
      bidPrice: '2064.75',
      askPrice: '2064.77',
      lastQty: '26.43',
    });

    const quote = await getDzengiQuote('ETH', 'USDT');

    expect(quote.symbol).toBe('ETH/USDT');
    expect(quote.bidPrice).toBe(2064.75);
    expect(quote.askPrice).toBe(2064.77);
    expect(quote.bidQty).toBe(26.43);
    expect(quote.askQty).toBe(26.43);
    expect(quote.midPrice).toBeCloseTo(2064.76, 2);
    expect(quote.spread).toBeCloseTo(0.02, 4);
    expect(quote.spreadPct).toBeGreaterThan(0);
    expect(quote.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should throw on HTTP error', async () => {
    mockFetch({}, 502);

    await expect(getDzengiQuote('ETH', 'USDT')).rejects.toThrow('Dzengi API error: 502');
  });

  it('should throw on Dzengi error response (code < 0)', async () => {
    mockFetch({ code: -1128, msg: 'symbol not found ETH/USDC' });

    await expect(getDzengiQuote('ETH', 'USDC')).rejects.toThrow('symbol not found');
  });

  it('should throw when no price data', async () => {
    mockFetch({ symbol: 'ETH/USDT' });

    await expect(getDzengiQuote('ETH', 'USDT')).rejects.toThrow('no price data');
  });

  it('should throw on invalid (NaN) prices', async () => {
    mockFetch({ bidPrice: 'NaN', askPrice: '100' });

    await expect(getDzengiQuote('ETH', 'USDT')).rejects.toThrow('invalid prices');
  });

  it('should throw on zero bid price', async () => {
    mockFetch({ bidPrice: '0', askPrice: '100' });

    await expect(getDzengiQuote('ETH', 'USDT')).rejects.toThrow('invalid prices');
  });

  it('should default lastQty to 0 when missing', async () => {
    mockFetch({
      symbol: 'BTC/USD',
      bidPrice: '50000.00',
      askPrice: '50001.00',
    });

    const quote = await getDzengiQuote('BTC', 'USD');

    expect(quote.bidQty).toBe(0);
    expect(quote.askQty).toBe(0);
  });

  it('should call correct URL with encoded symbol', async () => {
    mockFetch({
      bidPrice: '100',
      askPrice: '101',
      lastQty: '1',
    });

    await getDzengiQuote('ETH', 'USDT');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('ETH%2FUSDT'),
      expect.any(Object),
    );
  });

  it('should use api-adapter.dzengi.com base URL', async () => {
    mockFetch({
      bidPrice: '100',
      askPrice: '101',
    });

    await getDzengiQuote('ETH', 'USDT');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api-adapter.dzengi.com/api/v2/ticker/24hr'),
      expect.any(Object),
    );
  });
});

