/**
 * Unit-тесты для MarketDataClient.
 *
 * Все тесты с socket.io-client работают через jest.mock:
 * возвращаем фейковый сокет с jest.fn() методами.
 */

// ── Мок socket.io-client ─────────────────────────────────────

const mockSocketOn = jest.fn();
const mockSocketEmit = jest.fn();
const mockSocketConnect = jest.fn();
const mockSocketDisconnect = jest.fn();

const mockSocket = {
  connected: false,
  on: mockSocketOn,
  emit: mockSocketEmit,
  connect: mockSocketConnect,
  disconnect: mockSocketDisconnect,
};

const mockIo = jest.fn(() => mockSocket);

jest.mock('socket.io-client', () => ({
  io: mockIo,
}));

// ── Импорты ──────────────────────────────────────────────────

import { MarketDataClient } from '../market-data-client';
import type { UnifiedQuoteResult } from '../types';

// ── Helpers ──────────────────────────────────────────────────

function makeQuote(overrides: Partial<UnifiedQuoteResult> = {}): UnifiedQuoteResult {
  return {
    ok: true,
    sourceType: 'cex',
    source: 'binance',
    token0: 'ETH',
    token1: 'USDC',
    latencyMs: 10,
    timestamp: 1700000001000,
    bidPrice: 3500.5,
    askPrice: 3501.0,
    midPrice: 3500.75,
    spread: 0.5,
    spreadPct: 0.014,
    ...overrides,
  };
}

// ── Тесты ────────────────────────────────────────────────────

describe('MarketDataClient', () => {
  let originalUrl: string | undefined;
  let originalBaseUniswapV2Router: string | undefined;

  beforeEach(() => {
    originalUrl = process.env.MARKET_DATA_URL;
    originalBaseUniswapV2Router = process.env.BASE_UNISWAP_V2_ROUTER;
    jest.clearAllMocks();
    // Сбрасываем connected
    mockSocket.connected = false;
  });

  afterEach(() => {
    if (originalUrl !== undefined) {
      process.env.MARKET_DATA_URL = originalUrl;
    } else {
      delete process.env.MARKET_DATA_URL;
    }

    if (originalBaseUniswapV2Router !== undefined) {
      process.env.BASE_UNISWAP_V2_ROUTER = originalBaseUniswapV2Router;
    } else {
      delete process.env.BASE_UNISWAP_V2_ROUTER;
    }
  });

  // ── 1. noop если MARKET_DATA_URL не задан ─────────────────

  describe('когда MARKET_DATA_URL не задан', () => {
    beforeEach(() => {
      delete process.env.MARKET_DATA_URL;
    });

    it('write() не бросает ошибку и не создаёт сокет', () => {
      const client = new MarketDataClient();
      expect(() => client.write('test|key|bidPrice', 100)).not.toThrow();
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('writeQuote() не бросает ошибку', () => {
      const client = new MarketDataClient();
      expect(() => client.writeQuote(makeQuote())).not.toThrow();
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('writeBatch() не бросает ошибку', () => {
      const client = new MarketDataClient();
      expect(() =>
        client.writeBatch([{ key: 'test|key|bidPrice', value: 100 }]),
      ).not.toThrow();
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('disconnect() не бросает ошибку', () => {
      const client = new MarketDataClient();
      expect(() => client.disconnect()).not.toThrow();
    });
  });

  // ── 2. lazy connect ───────────────────────────────────────

  describe('lazy connect', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
    });

    it('сокет не создаётся при конструировании', () => {
      new MarketDataClient();
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('сокет создаётся при первом вызове write()', () => {
      mockSocket.connected = true; // считаем уже подключённым
      const client = new MarketDataClient();
      client.write('key', 100);
      expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it('сокет создаётся только один раз при нескольких write()', () => {
      mockSocket.connected = true;
      const client = new MarketDataClient();
      client.write('key1', 100);
      client.write('key2', 200);
      client.write('key3', 300);
      expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it('io() вызывается с правильным URL и namespace /store', () => {
      mockSocket.connected = true;
      const client = new MarketDataClient();
      client.write('key', 1);
      expect(mockIo).toHaveBeenCalledWith(
        'http://localhost:3002/store',
        expect.objectContaining({
          autoConnect: false,
          reconnection: true,
        }),
      );
    });
  });

  // ── 3. write() отправляет правильный payload ──────────────

  describe('write()', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
      mockSocket.connected = true;
    });

    it('вызывает socket.emit("write", { key, value, timestamp })', () => {
      const client = new MarketDataClient();
      client.write('binance|ETH/USDC|bidPrice', 3500.5, 1700000001000);
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'binance|ETH/USDC|bidPrice',
        value: 3500.5,
        timestamp: 1700000001000,
      });
    });

    it('вызывает socket.emit("write") без timestamp если он не передан', () => {
      const client = new MarketDataClient();
      client.write('key', 42);
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'key',
        value: 42,
        timestamp: undefined,
      });
    });
  });

  // ── 4. writeQuote() отправляет bid и ask ──────────────────

  describe('writeQuote()', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
      mockSocket.connected = true;
    });

    it('вызывает emit дважды — для bidPrice и askPrice', () => {
      const client = new MarketDataClient();
      client.writeQuote(makeQuote());

      expect(mockSocketEmit).toHaveBeenCalledTimes(2);

      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'binance|ETH/USDC|bidPrice',
        value: 3500.5,
        timestamp: 1700000001000,
      });
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'binance|ETH/USDC|askPrice',
        value: 3501.0,
        timestamp: 1700000001000,
      });
    });

    it('использует правильный формат ключа source|token0/token1|field', () => {
      const client = new MarketDataClient();
      client.writeQuote(makeQuote({ source: 'mexc', token0: 'ETH', token1: 'USDT' }));

      const calls = mockSocketEmit.mock.calls.map((c) => c[1].key);
      expect(calls).toContain('mexc|ETH/USDT|bidPrice');
      expect(calls).toContain('mexc|ETH/USDT|askPrice');
    });

    it('для DEX отправляет адреса пулов в bidPool и askPool', () => {
      const client = new MarketDataClient();
      client.writeQuote(makeQuote({
        sourceType: 'dex',
        source: 'dex:arbitrum',
        token0: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        token1: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        bestBuyPool: {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x6f38e884725a116c9c7fbf208e79fe8828a2595f',
        },
        bestSellPool: {
          dex: 'camelot',
          version: 'v3',
          poolAddress: '0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526',
        },
      }));

      expect(mockSocketEmit).toHaveBeenCalledTimes(4);
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'dex:arbitrum|0x82af49447d8a07e3bd95bd0d56f35241523fbab1/0xaf88d065e77c8cc2239327c5edb3a432268e5831|bidPool',
        value: {
          dex: 'camelot',
          version: 'v3',
          poolAddress: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
        },
        timestamp: 1700000001000,
      });
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'dex:arbitrum|0x82af49447d8a07e3bd95bd0d56f35241523fbab1/0xaf88d065e77c8cc2239327c5edb3a432268e5831|askPool',
        value: {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
        },
        timestamp: 1700000001000,
      });
    });

    it('для DEX не отправляет bidPool/askPool если адреса пулов отсутствуют', () => {
      const client = new MarketDataClient();
      client.writeQuote(makeQuote({ sourceType: 'dex', source: 'dex:arbitrum' }));

      const keys = mockSocketEmit.mock.calls.map((c) => c[1].key);
      expect(keys).toContain('dex:arbitrum|ETH/USDC|bidPrice');
      expect(keys).toContain('dex:arbitrum|ETH/USDC|askPrice');
      expect(keys).not.toContain('dex:arbitrum|ETH/USDC|bidPool');
      expect(keys).not.toContain('dex:arbitrum|ETH/USDC|askPool');
    });

    it('для version=v3 выбирает router по source (сети) + dex', () => {
      process.env.BASE_UNISWAP_V2_ROUTER = '0x00000000000000000000000000000000000000B1';

      const client = new MarketDataClient();
      client.writeQuote(makeQuote({
        sourceType: 'dex',
        source: 'dex:base',
        bestBuyPool: {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x6f38e884725a116c9c7fbf208e79fe8828a2595f',
        },
      }));

      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'dex:base|ETH/USDC|askPool',
        value: {
          dex: 'uniswap',
          version: 'v3',
          poolAddress: '0x00000000000000000000000000000000000000B1',
        },
        timestamp: 1700000001000,
      });
    });
  });

  // ── 5. writeQuote() пропускает quote с ok=false ───────────

  describe('writeQuote() с ok=false', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
      mockSocket.connected = true;
    });

    it('не вызывает socket.emit если quote.ok = false', () => {
      const client = new MarketDataClient();
      client.writeQuote(makeQuote({ ok: false }));
      expect(mockSocketEmit).not.toHaveBeenCalled();
    });
  });

  // ── 6. writeBatch() ───────────────────────────────────────

  describe('writeBatch()', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
      mockSocket.connected = true;
    });

    it('вызывает socket.emit("write") для каждого point', () => {
      const client = new MarketDataClient();
      client.writeBatch([
        { key: 'binance|ETH/USDC|bidPrice', value: 3500.5, timestamp: 1000 },
        { key: 'binance|ETH/USDC|askPrice', value: 3501.0, timestamp: 1000 },
        { key: 'mexc|ETH/USDT|bidPrice', value: 3499.8 },
      ]);

      expect(mockSocketEmit).toHaveBeenCalledTimes(3);
      expect(mockSocketEmit).toHaveBeenNthCalledWith(1, 'write', {
        key: 'binance|ETH/USDC|bidPrice',
        value: 3500.5,
        timestamp: 1000,
      });
      expect(mockSocketEmit).toHaveBeenNthCalledWith(3, 'write', {
        key: 'mexc|ETH/USDT|bidPrice',
        value: 3499.8,
        timestamp: undefined,
      });
    });

    it('ничего не делает для пустого массива', () => {
      const client = new MarketDataClient();
      client.writeBatch([]);
      expect(mockSocketEmit).not.toHaveBeenCalled();
    });
  });

  // ── 7. disconnect() ───────────────────────────────────────

  describe('disconnect()', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
      mockSocket.connected = true;
    });

    it('вызывает socket.disconnect()', () => {
      const client = new MarketDataClient();
      client.write('key', 1); // создаём сокет
      client.disconnect();
      expect(mockSocketDisconnect).toHaveBeenCalledTimes(1);
    });

    it('не бросает ошибку если сокет ещё не создан', () => {
      const client = new MarketDataClient();
      expect(() => client.disconnect()).not.toThrow();
    });
  });

  // ── 8. connect() вызывается если сокет не подключён ───────

  describe('auto-connect', () => {
    beforeEach(() => {
      process.env.MARKET_DATA_URL = 'http://localhost:3002';
      mockSocket.connected = false; // НЕ подключён
    });

    it('вызывает socket.connect() при write() если connected = false', () => {
      const client = new MarketDataClient();
      client.write('key', 1);
      expect(mockSocketConnect).toHaveBeenCalledTimes(1);
    });

    it('не вызывает connect повторно если уже подключён', () => {
      mockSocket.connected = true;
      const client = new MarketDataClient();
      client.write('key', 1);
      client.write('key', 2);
      expect(mockSocketConnect).not.toHaveBeenCalled();
    });
  });
});

