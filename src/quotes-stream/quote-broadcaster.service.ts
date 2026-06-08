import { EventEmitter } from 'node:events';
import { Injectable } from '@nestjs/common';
import type { UnifiedQuoteResult } from '../jobs/shared/types';
import {
  quoteToWritePoints,
  type PoolValue,
  type QuoteWritePoint,
} from '../jobs/shared/quote-write-points';

export type QuoteDataPoint = { t?: number; v: number | PoolValue };
export type QuoteDataChangeCallback = (
  key: string,
  point: QuoteDataPoint,
) => void;

@Injectable()
export class QuoteBroadcasterService {
  private readonly emitter = new EventEmitter();
  private readonly lastValueByKey = new Map<string, QuoteDataPoint['v']>();

  constructor() {
    this.emitter.setMaxListeners(500);
  }

  publishQuote(quote: UnifiedQuoteResult): void {
    // console.log('quoteToWritePoints(quote)', quoteToWritePoints(quote));
    this.publishPoints(quoteToWritePoints(quote));
  }

  publishPoint(point: QuoteWritePoint): void {
    const nextValue = point.value;
    const prevValue = this.lastValueByKey.get(point.key);
    if (valuesEqual(prevValue, nextValue)) {
      return;
    }

    const dataPoint: QuoteDataPoint =
      typeof nextValue === 'number'
        ? { t: point.timestamp ?? Date.now(), v: nextValue }
        : { v: nextValue };

    this.lastValueByKey.set(point.key, nextValue);

    this.emitter.emit(point.key, dataPoint);
    this.emitter.emit('__any__', point.key, dataPoint);
  }

  publishPoints(points: QuoteWritePoint[]): void {
    for (const point of points) {
      this.publishPoint(point);
    }
  }

  onChangeMulti(keys: string[], cb: QuoteDataChangeCallback): () => void {
    const wrappers = new Map<string, (point: QuoteDataPoint) => void>();

    for (const key of keys) {
      const wrapper = (point: QuoteDataPoint) => cb(key, point);
      wrappers.set(key, wrapper);
      this.emitter.on(key, wrapper);
    }

    return () => {
      for (const [key, wrapper] of wrappers) {
        this.emitter.off(key, wrapper);
      }
    };
  }

  onAnyChange(cb: QuoteDataChangeCallback): () => void {
    this.emitter.on('__any__', cb);
    return () => {
      this.emitter.off('__any__', cb);
    };
  }
}

export const quoteBroadcaster = new QuoteBroadcasterService();

function valuesEqual(
  left: QuoteDataPoint['v'] | undefined,
  right: QuoteDataPoint['v'],
): boolean {
  if (left === undefined) return false;
  if (typeof left === 'number' && typeof right === 'number') {
    return left === right;
  }
  if (typeof left === 'number' || typeof right === 'number') {
    return false;
  }
  return (
    left.dex === right.dex &&
    left.version === right.version &&
    left.poolAddress === right.poolAddress
  );
}
