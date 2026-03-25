import {BinanceQuote} from './getBinanceQuote';
import {MexcQuote} from '../../getMexcQuotes/helpers/getMexcQuote';
import {BybitQuote} from '../../getBybitQuotes/helpers/getBybitQuote';
import {OkxQuote} from '../../getOkxQuotes/helpers/getOkxQuote';
import {KucoinQuote} from '../../getKucoinQuotes/helpers/getKucoinQuote';
import {GateioQuote} from '../../getGateioQuotes/helpers/getGateioQuote';
import {CexQuote} from '../../../store/state.types';

// ── CEX taker fees (%) ──
const CEX_TAKER_FEE: Record<string, number> = {
  Binance: 0,   // без комиссии
  MEXC:    0,   // без комиссии
  Bybit:   0,   // без комиссии
  OKX:     0,   // без комиссии
  KuCoin:  0,   // без комиссии
  GateIO:  0,   // без комиссии
};


export function toCexQuote(name: string, q: BinanceQuote | MexcQuote | BybitQuote | OkxQuote | KucoinQuote | GateioQuote): CexQuote {
  const feePct = CEX_TAKER_FEE[name] ?? 0.10;
  const feeMulti = feePct / 100;
  return {
    name,
    symbol: q.symbol,
    bidPrice: q.bidPrice,
    askPrice: q.askPrice,
    effectiveBid: q.bidPrice * (1 - feeMulti),
    effectiveAsk: q.askPrice * (1 + feeMulti),
    midPrice: q.midPrice,
    spread: q.spread,
    spreadPct: q.spreadPct,
    takerFeePct: feePct,
    latencyMs: q.latencyMs,
  };
}
