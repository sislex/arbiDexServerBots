/**
 * MarketDataClient — клиент для отправки котировок в arbiDexMarketData
 * через единый WebSocket (Socket.IO) на весь процесс.
 *
 * Поведение:
 * - Lazy-singleton: сокет создаётся при первом вызове write().
 * - Если MARKET_DATA_URL не задан — все методы работают как noop.
 * - fire-and-forget: write() синхронный, не ждёт ack.
 * - Авто-реконнект средствами socket.io-client.
 */

import { io, Socket } from 'socket.io-client';
import type { UnifiedQuoteResult } from './types';
import { quoteToWritePoints, type QuoteWritePoint } from './quote-write-points';

export class MarketDataClient {
  private socket: Socket | null = null;
  private connecting = false;
  private readonly url: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(url?: string, apiKey?: string) {
    this.url = url ?? process.env.MARKET_DATA_URL;
    this.apiKey = apiKey ?? process.env.MARKET_DATA_API_KEY;
  }

  // ── Public API ──────────────────────────────────────────────

  /**
   * Записать одну точку в arbiDexMarketData.
   * Fire-and-forget — не ждёт подтверждения.
   */
  write(
    key: string,
    value: QuoteWritePoint['value'],
    timestamp?: number,
  ): void {
    if (!this.url) return;

    const socket = this.getSocket();
    socket.emit('write', { key, value, timestamp });
  }

  /**
   * Записать массив точек.
   * Каждая точка — отдельный emit (asyncapi поддерживает только single write).
   */
  writeBatch(points: QuoteWritePoint[]): void {
    if (!this.url || points.length === 0) return;

    const socket = this.getSocket();
    for (const p of points) {
      socket.emit('write', {
        key: p.key,
        value: p.value,
        timestamp: p.timestamp,
      });
    }
  }

  /**
   * Конвертирует UnifiedQuoteResult → два write: bidPrice и askPrice.
   * Пропускает quote с ok=false.
   */
  writeQuote(quote: UnifiedQuoteResult): void {
    if (!this.url) return;
    this.writeBatch(quoteToWritePoints(quote));
  }

  /**
   * Закрыть WebSocket соединение.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // ── Private ─────────────────────────────────────────────────

  /**
   * Lazy-инициализация сокета. Создаётся один раз и переиспользуется.
   * connect() вызывается строго один раз — флаг `connecting` предотвращает
   * повторные вызовы, пока хендшейк не завершился.
   */
  private getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(`${this.url}/store`, {
        autoConnect: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        ...(this.apiKey ? { auth: { apiKey: this.apiKey } } : {}),
      });

      this.attachListeners(this.socket);
    }

    if (!this.socket.connected && !this.connecting) {
      this.connecting = true;
      this.socket.connect();
    }

    return this.socket;
  }

  private attachListeners(socket: Socket): void {
    socket.on('connect', () => {
      this.connecting = false;
      console.log(
        `[MarketDataClient] ✅ connected  id=${socket.id}  url=${this.url}`,
      );
    });

    socket.on('disconnect', (reason: string) => {
      this.connecting = false;
      console.log(`[MarketDataClient] 🔌 disconnected  reason=${reason}`);
    });

    socket.on('connect_error', (err: Error) => {
      this.connecting = false;
      console.error(`[MarketDataClient] ❌ connect_error: ${err.message}`);
    });

    socket.on('error', (payload: { message: string }) => {
      console.error(
        `[MarketDataClient] ❌ server error: ${payload?.message ?? payload}`,
      );
    });
  }
}

/**
 * Глобальный singleton. Все джобы импортируют и используют этот экземпляр,
 * чтобы разделять одно WebSocket-соединение.
 */
export const marketDataClient = new MarketDataClient();
