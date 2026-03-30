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
    symbol: 'ETHUSDC',
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

  beforeEach(() => {
    originalUrl = process.env.MARKET_DATA_URL;
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
      client.write('binance|ETHUSDC|bidPrice', 3500.5, 1700000001000);
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'binance|ETHUSDC|bidPrice',
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
        key: 'binance|ETHUSDC|bidPrice',
        value: 3500.5,
        timestamp: 1700000001000,
      });
      expect(mockSocketEmit).toHaveBeenCalledWith('write', {
        key: 'binance|ETHUSDC|askPrice',
        value: 3501.0,
        timestamp: 1700000001000,
      });
    });

    it('использует правильный формат ключа source|symbol|field', () => {
      const client = new MarketDataClient();
      client.writeQuote(makeQuote({ source: 'mexc', symbol: 'ETHUSDT' }));

      const calls = mockSocketEmit.mock.calls.map((c) => c[1].key);
      expect(calls).toContain('mexc|ETHUSDT|bidPrice');
      expect(calls).toContain('mexc|ETHUSDT|askPrice');
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
        { key: 'binance|ETHUSDC|bidPrice', value: 3500.5, timestamp: 1000 },
        { key: 'binance|ETHUSDC|askPrice', value: 3501.0, timestamp: 1000 },
        { key: 'mexc|ETHUSDT|bidPrice', value: 3499.8 },
      ]);

      expect(mockSocketEmit).toHaveBeenCalledTimes(3);
      expect(mockSocketEmit).toHaveBeenNthCalledWith(1, 'write', {
        key: 'binance|ETHUSDC|bidPrice',
        value: 3500.5,
        timestamp: 1000,
      });
      expect(mockSocketEmit).toHaveBeenNthCalledWith(3, 'write', {
        key: 'mexc|ETHUSDT|bidPrice',
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

