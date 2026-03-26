import { EventEmitter } from 'node:events';
import { UnifiedQuoteResult } from './types';

// ── Типы ────────────────────────────────────────────────────

export interface PricePoint {
  timestamp: number;
  value: number;
}

export type PriceChangeCallback = (point: PricePoint, key: string) => void;

// ── Класс ───────────────────────────────────────────────────

export class PriceStore {
  private readonly maxPoints: number;
  private readonly store = new Map<string, PricePoint[]>();
  private readonly emitter = new EventEmitter();

  constructor(maxPoints = 100000) {
    this.maxPoints = maxPoints;
    this.emitter.setMaxListeners(100);
  }

  /** Формирует ключ: `source|symbol|field` */
  static makeKey(source: string, symbol: string, field: 'bidPrice' | 'askPrice'): string {
    return `${source}|${symbol}|${field}`;
  }

  /**
   * Сохраняет bidPrice и askPrice из UnifiedQuoteResult.
   * Ключи: `source|symbol|bidPrice`, `source|symbol|askPrice`.
   * Дедупликация по value. Лимит точек (FIFO — первое убирается).
   */
  recordQuote(quote: UnifiedQuoteResult): void {
    if (!quote.ok) return;
    const ts = quote.timestamp;
    this.pushPoint(PriceStore.makeKey(quote.source, quote.symbol, 'bidPrice'), ts, quote.bidPrice);
    this.pushPoint(PriceStore.makeKey(quote.source, quote.symbol, 'askPrice'), ts, quote.askPrice);
  }

  /** Серия точек по ключу. */
  getSeries(key: string): PricePoint[] {
    return this.store.get(key) ?? [];
  }

  /** Последняя точка по ключу (или null). */
  getLastPoint(key: string): PricePoint | null {
    const s = this.store.get(key);
    return s && s.length > 0 ? s[s.length - 1] : null;
  }

  /** Все ключи с данными. */
  getSeriesKeys(): string[] {
    return Array.from(this.store.keys());
  }

  /** Подписка на один ключ. Возвращает функцию отписки. */
  onPriceChange(key: string, cb: PriceChangeCallback): () => void {
    const event = `change:${key}`;
    this.emitter.on(event, cb);
    return () => { this.emitter.off(event, cb); };
  }

  /** Подписка на список ключей. Возвращает одну функцию отписки от всех. */
  onPriceChangeMulti(keys: string[], cb: PriceChangeCallback): () => void {
    const unsubs = keys.map((k) => this.onPriceChange(k, cb));
    return () => { unsubs.forEach((off) => off()); };
  }

  /** Подписка на любое изменение (все ключи). */
  onAnyPriceChange(cb: PriceChangeCallback): () => void {
    this.emitter.on('change', cb);
    return () => { this.emitter.off('change', cb); };
  }

  /** Очищает все данные и подписки. */
  clear(): void {
    this.store.clear();
    this.emitter.removeAllListeners();
  }

  // ── Private ─────────────────────────────────────────────

  private pushPoint(key: string, timestamp: number, value: number): void {
    let series = this.store.get(key);
    if (!series) {
      series = [];
      this.store.set(key, series);
    }

    const last = series.length > 0 ? series[series.length - 1] : null;
    if (last && last.value === value) return;

    if (series.length >= this.maxPoints) {
      series.shift();
    }

    const point: PricePoint = { timestamp, value };
    series.push(point);

    this.emitter.emit(`change:${key}`, point, key);
    this.emitter.emit('change', point, key);
  }
}

/** Глобальный экземпляр для использования из джоб. */
export const priceStore = new PriceStore();

