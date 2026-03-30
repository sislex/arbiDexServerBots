# 🤖 Integration Guide — arbiDexServerBots

> **Author:** Aliaksei Razhnou  
> This document is intended for AI agents and developers who want to programmatically
> interact with the **arbiDexServerBots** quote-collection server.

---

## 1. Project Overview

**arbiDexServerBots** is a NestJS server (TypeScript) that:

1. Collects **bid/ask** quotes in parallel from **6 CEX exchanges** (Binance, MEXC, Bybit, OKX, KuCoin, Gate.io) and **1 DEX source** (Arbitrum on-chain via the `ArbQuoter` contract).
2. Normalises all quotes into a **unified format** `UnifiedQuoteResult`.
3. Forwards every quote to **arbiDexMarketData** — an external time-series microservice — via a single persistent **WebSocket** (Socket.IO).
4. Exposes a **REST API** for bot management, system status, and rule configuration.

### Stack

| Component | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript (strict) |
| Blockchain | ethers.js v6, viem v2 (Arbitrum One) |
| WebSocket | Socket.IO (via `@nestjs/websockets`) |
| Market data sink | arbiDexMarketData (Socket.IO client) |
| Containerisation | Docker / docker-compose |

---

## 2. Running the Service

```bash
# Install dependencies
npm install

# Start (development)
npm run start          # listens on port 3000

# Start (watch mode)
npm run start:dev

# Start in Docker
npm run start:docker   # docker-compose up --build -d, port 1001 → 3000
```

### Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Wallet private key (hex) |
| `ARBITRUM_ALCHEMY_RPC` | Alchemy RPC endpoint for Arbitrum One |
| `ARBITRUM_RPC` | Public Arbitrum RPC |
| `QUOTER_ADDRESS` | `ArbQuoter` contract address (on-chain quoter) |
| `EXECUTOR_ADDRESS` | `ArbExecutor` contract address |
| `CONFIG_STORE_ADDRESS` | ConfigStore contract address |
| `CALLER_ADDRESS` | Caller address |
| `PORT` | HTTP server port (default `3000`) |
| `MARKET_DATA_URL` | arbiDexMarketData base URL (e.g. `http://45.135.182.251:3002`) |
| `MARKET_DATA_API_KEY` | API key for arbiDexMarketData (leave empty if auth is disabled) |

---

## 3. API Documentation (Swagger / OpenAPI)

**Swagger UI:** `http://localhost:3000/api` — interactive API explorer for humans.  
**OpenAPI JSON:** `http://localhost:3000/api-json` — machine-readable spec for AI agents and code generators.

All endpoints are fully documented with summaries, descriptions, parameter schemas, request body examples, and response schemas. AI agents can fetch `http://localhost:3000/api-json` to auto-discover the API.

---

## 4. REST API

**Base URL:** `http://localhost:3000`

### 4.1 System Information

| Method | URL | Description |
|---|---|---|
| `GET` | `/info` | App version, start time, bot count |
| `GET` | `/info/bots-types-list` | List of bot types |
| `GET` | `/info/apis` | All registered API endpoints |
| `GET` | `/info/job-type-list` | List of job types |
| `GET` | `/store` | Full application state snapshot |

### 4.2 Bot Management

| Method | URL | Description |
|---|---|---|
| `GET` | `/bots/get-all` | List all bots (id, params) |
| `GET` | `/bot/:botId/params` | Bot parameters |
| `GET` | `/bot/:botId/settings` | Bot settings (botParams + jobParams) |
| `PUT` | `/bot/:botId/settings` | Update settings. Body: `{ botParams: string(JSON), jobParams: string(JSON) }` |
| `GET` | `/bot/:botId/errors` | Bot error list |
| `POST` | `/bot/:botId/pause` | Pause / resume. Body: `{ pause: boolean }` |
| `POST` | `/bot/:botId/restart` | Restart the bot |
| `GET` | `/bot/:botId/arbitrage` | Arbitrage results for the bot |
| `POST` | `/setBotsRulesList` | Replace the full bot rules list. Body: `{ botsRulesList: IBotsRule[] }` |

### 4.3 Errors

| Method | URL | Description |
|---|---|---|
| `GET` | `/errors` | List all errors |
| `DELETE` | `/errors` | Clear all errors |

---

## 5. Market Data — arbiDexMarketData

All price data collected by arbiDexServerBots is forwarded to the **arbiDexMarketData**
microservice in real time. arbiDexMarketData is the single source of truth for market data.

- **Deployed at:** `http://45.135.182.251:3002`
- **Swagger UI:** `http://45.135.182.251:3002/api`
- **OpenAPI JSON:** `http://45.135.182.251:3002/api-json`

### 5.1 Price Key Format

```
<source>|<symbol>|<bidPrice|askPrice>
```

Examples:
```
binance|ETHUSDC|bidPrice
binance|ETHUSDC|askPrice
mexc|ETHUSDT|bidPrice
dex:arbitrum|WETH/USDC|askPrice
okx|ETH-USDT|bidPrice
kucoin|ETH-USDT|askPrice
bybit|ETHUSDT|bidPrice
gateio|ETH_USDT|askPrice
```

### 5.2 Data Point Format

```typescript
interface DataPoint {
  t: number;  // timestamp (ms), Unix epoch — Date.now()
  v: number;  // numeric value (price)
}
```

### 5.3 Reading Data via REST (arbiDexMarketData)

```bash
# All available keys
curl http://45.135.182.251:3002/store/keys

# Latest point for a key
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice/latest"

# Full series with optional filters (?limit=50 / ?from=ms&to=ms)
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?limit=50"

# Time-range query
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?from=1700000000000&to=1700000099000"

# Multiple keys at once
curl -X POST http://45.135.182.251:3002/store/keys \
  -H 'Content-Type: application/json' \
  -d '{
    "keys": [
      "binance|ETHUSDC|bidPrice",
      "binance|ETHUSDC|askPrice",
      "dex:arbitrum|WETH/USDC|bidPrice",
      "dex:arbitrum|WETH/USDC|askPrice"
    ],
    "limit": 10
  }'
```

#### Response for `/store/key/:key`

```json
{
  "key": "binance|ETHUSDC|bidPrice",
  "points": [
    { "t": 1774548817787, "v": 2049.2 },
    { "t": 1774548818034, "v": 2049.5 }
  ],
  "count": 2,
  "last": { "t": 1774548818034, "v": 2049.5 }
}
```

> **Deduplication:** if the price has not changed, a new point is not written.
> Gaps between points indicate periods when the price remained constant.

### 5.4 Subscribing to Real-Time Updates (WebSocket)

**Namespace:** `/store`  
**URL:** `ws://45.135.182.251:3002/store`

```typescript
import { io } from 'socket.io-client';

const socket = io('http://45.135.182.251:3002/store');

socket.on('connect', () => {
  // Subscribe to specific keys
  socket.emit('subscribe', {
    keys: [
      'binance|ETHUSDC|bidPrice',
      'binance|ETHUSDC|askPrice',
      'dex:arbitrum|WETH/USDC|bidPrice',
    ]
  });

  // Or subscribe to ALL keys
  socket.emit('subscribe', {});
});

socket.on('dataChange', ({ key, point }) => {
  // point = { t: <unix_ms>, v: <price> }
  console.log(`${key} = ${point.v} @ ${new Date(point.t).toISOString()}`);
});

socket.on('subscribed', (info) => {
  console.log('Subscribed:', info); // { keys: [...] } or { keys: 'all' }
});
```

#### WebSocket Event Reference

| Client → Server | Payload | Description |
|---|---|---|
| `subscribe` | `{ keys?: string[] }` | Subscribe to keys. Empty / omitted `keys` = subscribe to all |
| `unsubscribe` | — | Cancel all subscriptions |

| Server → Client | Payload | Description |
|---|---|---|
| `subscribed` | `{ keys: string[] \| 'all' }` | Subscription confirmed |
| `unsubscribed` | `{}` | Unsubscription confirmed |
| `dataChange` | `{ key: string, point: DataPoint }` | New price point for a subscribed key |

### 5.5 Python Client Example

```python
import socketio

sio = socketio.Client()

@sio.on('dataChange', namespace='/store')
def on_data_change(data):
    print(f"{data['key']} → {data['point']['v']}")

@sio.on('subscribed', namespace='/store')
def on_subscribed(data):
    print(f"Subscribed: {data}")

sio.connect('http://45.135.182.251:3002', namespaces=['/store'])
sio.emit('subscribe', {'keys': ['binance|ETHUSDC|bidPrice']}, namespace='/store')
sio.wait()
```

---

## 6. Key Data Types

### 6.1 UnifiedQuoteResult

All 7 quote sources are normalised to this format:

```typescript
interface UnifiedQuoteResult {
  sourceType: 'cex' | 'dex';
  source: QuoteSourceName;   // 'binance' | 'mexc' | 'bybit' | 'okx' | 'kucoin' | 'gateio' | 'dex:arbitrum'
  symbol: string;            // "ETHUSDC", "ETH-USDT", "WETH/USDC", etc.
  ok: boolean;
  latencyMs: number;
  error?: string;
  timestamp: number;         // Date.now()

  // Prices
  bidPrice: number;          // best buyer price (bid) — you can SELL the base asset at this price
  askPrice: number;          // best seller price (ask) — you can BUY the base asset at this price
  midPrice: number;          // (bid + ask) / 2
  spread: number;            // ask − bid
  spreadPct: number;         // spread / midPrice × 100

  // CEX-specific
  bidQty?: number;
  askQty?: number;

  // DEX-specific
  blockNumber?: number;
  gasUsed?: string;
  poolsCount?: number;
  bestBuyPool?: PoolBrief | null;
  bestSellPool?: PoolBrief | null;
}
```

### 6.2 Bid / Ask Semantics

| Term | Meaning | Example (ETH/USDC) |
|---|---|---|
| `bidPrice` | Price at which you can **SELL** the base asset (ETH) | 2049.20 USDC |
| `askPrice` | Price at which you can **BUY** the base asset (ETH) | 2049.80 USDC |

For **CEX**: `bidPrice` = best order-book bid, `askPrice` = best order-book ask.  
For **DEX**: `bidPrice` = bestSellPrice (ETH sell price), `askPrice` = bestBuyPrice (ETH buy price).

### 6.3 IBotsRule (Bot Configuration)

```typescript
interface IBotsRule {
  id: string;              // unique ID, e.g. "Binance_USDC_WETH"
  botParams: IBotParams;
  jobParams: IJobParams;   // depends on jobType
}

interface IBotParams {
  botType: 'TestBot';
  paused: boolean;
  isRepeat: boolean;
  delayBetweenRepeat?: number;  // ms between iterations
  maxJobs: number;
  maxErrors?: number;
  maxArbitrage?: number;
  timeoutMs?: number;           // timeout per job (ms)
}
```

### 6.4 Job Types (IJobType)

| JobType | Description | Key jobParams fields |
|---|---|---|
| `get_Cex_Quotes` | CEX quote | `source`: `CexSourceName`, `symbol?` |
| `get_Dex_Quotes_By_Arb_Quoter` | DEX on-chain quoting | `source`, `rpcUrl`, `pairsToQuote: IPool[]`, `symbol?` |
| `get_Pool_State` | Pool tick/state | `rpcUrl`, `poolAddress`, `wordsAround`, `maxTicks` |
| `get_Executor_Balances` | ArbExecutor balances | `rpcUrl?`, `executorAddress?` |
| `getArbExecutorQuotes` | Quotes via ArbExecutor | `rpcUrl`, `pairsToQuote: IQuote[]` |

### 6.5 IPool (DEX Pool)

```typescript
interface IPool {
  dex: 'uniswap' | 'sushi' | 'pancake' | 'camelot';
  version: 'v2' | 'v3';
  poolAddress: string;     // 0x...
  token0: Address;         // 0x...
  token1: Address;         // 0x...
  feePpm?: number;         // Fee in ppm (100 = 0.01%, 500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
}

type Address = `0x${string}`;
```

### 6.6 CEX Source → Default Symbol

| Source | Default Symbol | Format |
|---|---|---|
| `binance` | `ETHUSDC` | `BASEQUOTE` |
| `mexc` | `ETHUSDT` | `BASEQUOTE` |
| `bybit` | `ETHUSDT` | `BASEQUOTE` |
| `okx` | `ETH-USDT` | `BASE-QUOTE` |
| `kucoin` | `ETH-USDT` | `BASE-QUOTE` |
| `gateio` | `ETH_USDT` | `BASE_QUOTE` |

---

## 7. Project Architecture

> **Author:** Aliaksei Razhnou

```
src/
├── main.ts                          # Entry point, NestJS bootstrap, port 3000
├── app.module.ts                    # Root module
│
├── controllers/
│   ├── app.controller.ts            # /info, /rules, /getPoolsByFactory
│   ├── bots.controller.ts           # /bots/*, /bot/:id/*
│   ├── store.controller.ts          # /store (full state snapshot)
│   └── ui-errors.controller.ts      # /errors
│
├── store/                           # Redux-like store (BehaviorSubject + reducer)
│   ├── app.store.ts                 # AppStore (Injectable)
│   ├── state.types.ts               # All interfaces and enums
│   ├── reducer.ts                   # Reducer + initialState
│   ├── actions.ts                   # Action types
│   ├── selectors.ts                 # Selectors
│   └── stabs/
│       ├── bots-list.stabs.ts       # BotList10 — config for 7 bots (6 CEX + 1 DEX)
│       └── tokens.stabs.ts          # Token constants (USDC, WETH, ...)
│
├── bots/
│   ├── bot-factory.ts               # Bot factory
│   ├── bot-runner.service.ts        # Runs bots from botsRulesList
│   └── test/testBot.ts              # TestBot — generic bot (loop + job)
│
├── jobs/
│   ├── handlers.ts                  # Routes jobType → handler function
│   ├── getCexQuotes/                # Single CEX job for all 6 exchanges
│   │   ├── getCexQuotes.ts
│   │   ├── types.ts
│   │   └── helpers/                 # getBinanceQuote, getMexcQuote, ...
│   ├── getDexQuotesByArbQuoter/     # DEX quoting via ArbQuoter contract
│   │   ├── getDexQuotesByArbQuoter.ts
│   │   └── helpers/                 # fetchBuySellQuotes, calculateQuotes, ...
│   └── shared/                      # Shared utilities
│       ├── types.ts                 # UnifiedQuoteResult, PoolBrief, ...
│       ├── market-data-client.ts    # MarketDataClient — WebSocket client for arbiDexMarketData
│       ├── printUnifiedQuotesTable.ts
│       ├── adapters/
│       │   ├── cexToUnified.ts      # CEX → UnifiedQuoteResult
│       │   └── dexToUnified.ts      # DEX → UnifiedQuoteResult
│       └── index.ts                 # Re-exports
│
├── helpers/                         # Utilities (dex.constants, address helpers, ...)
├── arbitrage/                       # Arbitrage search logic
├── swap/                            # On-chain swap execution
├── artifacts/                       # Contract ABIs (ArbQuoter, ArbExecutor, ...)
└── scripts/                         # Standalone scripts for manual runs
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      BotRunnerService                        │
│  (reads botsRulesList, creates one TestBot per rule)         │
└────────────────────┬────────────────────────────────────────┘
                     │ spawns N bots
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  TestBot (loop)                                              │
│  ┌──────────────────────────────┐                            │
│  │ runJob(jobParams)            │  ← handlers.ts             │
│  │  → getCexQuotes(source)      │                            │
│  │  → getDexQuotesByArbQuoter() │                            │
│  └──────────────┬───────────────┘                            │
│                 │ UnifiedQuoteResult                         │
│                 ▼                                            │
│  marketDataClient.writeQuote(unified)  ←── fire-and-forget   │
└────────────────────┬────────────────────────────────────────┘
                     │ Socket.IO  emit('write', {key, value, ts})
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  arbiDexMarketData  (http://45.135.182.251:3002)             │
│  In-memory time-series store                                 │
│  REST API  +  WebSocket subscriptions                        │
└─────────────────────────────────────────────────────────────┘
```

### MarketDataClient — Singleton WebSocket Client

`src/jobs/shared/market-data-client.ts`  
**Author:** Aliaksei Razhnou

- **Lazy-singleton**: the WebSocket connection is created on the first `write()` call.
- **One shared socket** for the entire process — all jobs reuse the same connection.
- **Noop** when `MARKET_DATA_URL` is not set — nothing crashes, useful for local dev without arbiDexMarketData.
- **Auto-reconnect** via socket.io-client (`reconnectionAttempts: Infinity`).
- **Fire-and-forget**: `write()` is synchronous, no ack awaited.

```typescript
import { marketDataClient } from './jobs/shared';

// Write a single point
marketDataClient.write('binance|ETHUSDC|bidPrice', 2049.2, Date.now());

// Write a unified quote (two writes: bidPrice + askPrice)
marketDataClient.writeQuote(unifiedQuoteResult);

// Write a batch
marketDataClient.writeBatch([
  { key: 'binance|ETHUSDC|bidPrice', value: 2049.2 },
  { key: 'binance|ETHUSDC|askPrice', value: 2049.8 },
]);
```

---

## 8. Integration: Reading Market Data

All market data is available via **arbiDexMarketData** at `http://45.135.182.251:3002`.

### 8.1 Get Current Best Prices (REST)

```bash
# 1. List available keys
curl http://45.135.182.251:3002/store/keys
# → ["binance|ETHUSDC|bidPrice","binance|ETHUSDC|askPrice","dex:arbitrum|WETH/USDC|bidPrice",...]

# 2. Latest price for a key
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice/latest"
# → { "t": 1774548818034, "v": 2049.5 }

# 3. Full series — last 50 points
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?limit=50"

# 4. Time-range query
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?from=1700000000000&to=1700000099000"

# 5. Multiple keys at once
curl -X POST http://45.135.182.251:3002/store/keys \
  -H 'Content-Type: application/json' \
  -d '{
    "keys": [
      "binance|ETHUSDC|bidPrice",
      "binance|ETHUSDC|askPrice",
      "dex:arbitrum|WETH/USDC|bidPrice",
      "dex:arbitrum|WETH/USDC|askPrice"
    ]
  }'
```

### 8.2 Subscribe to Real-Time Updates (WebSocket)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://45.135.182.251:3002/store');

socket.on('connect', () => {
  socket.emit('subscribe', {
    keys: [
      'binance|ETHUSDC|bidPrice',
      'binance|ETHUSDC|askPrice',
      'dex:arbitrum|WETH/USDC|bidPrice',
      'dex:arbitrum|WETH/USDC|askPrice',
    ]
  });
});

socket.on('dataChange', ({ key, point }) => {
  console.log(`${key} = ${point.v} @ ${new Date(point.t).toISOString()}`);
});
```

---

## 9. Integration: Bot Management

### 9.1 Restart with New Rules

```bash
curl -X POST http://localhost:3000/setBotsRulesList \
  -H 'Content-Type: application/json' \
  -d '{
    "botsRulesList": [
      {
        "id": "Binance_USDC_WETH",
        "botParams": {
          "botType": "TestBot",
          "paused": false,
          "isRepeat": true,
          "delayBetweenRepeat": 200,
          "maxJobs": 1000000,
          "maxErrors": 100,
          "timeoutMs": 30000
        },
        "jobParams": {
          "jobType": "get_Cex_Quotes",
          "source": "binance",
          "symbol": "ETHUSDC"
        }
      },
      {
        "id": "Arbitrum_USDC_WETH",
        "botParams": {
          "botType": "TestBot",
          "paused": false,
          "isRepeat": true,
          "delayBetweenRepeat": 500,
          "maxJobs": 1000000,
          "maxErrors": 100,
          "timeoutMs": 30000
        },
        "jobParams": {
          "jobType": "get_Dex_Quotes_By_Arb_Quoter",
          "source": "dex:arbitrum",
          "symbol": "WETH/USDC",
          "rpcUrl": "https://arb1.arbitrum.io/rpc",
          "pairsToQuote": [
            {
              "dex": "uniswap",
              "version": "v3",
              "poolAddress": "0xc6962004f452be9203591991d15f6b388e09e8d0",
              "token0": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
              "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
              "feePpm": 500
            }
          ]
        }
      }
    ]
  }'
```

### 9.2 Pause / Resume / Restart a Bot

```bash
# Pause
curl -X POST http://localhost:3000/bot/Binance_USDC_WETH/pause \
  -H 'Content-Type: application/json' \
  -d '{"pause": true}'

# Resume
curl -X POST http://localhost:3000/bot/Binance_USDC_WETH/pause \
  -H 'Content-Type: application/json' \
  -d '{"pause": false}'

# Restart
curl -X POST http://localhost:3000/bot/Binance_USDC_WETH/restart
```

---

## 10. Integration: Adding a New Quote Source

> **Author:** Aliaksei Razhnou

### 10.1 New CEX Source

1. Create `src/jobs/getCexQuotes/helpers/getNewExchangeQuote.ts`:

```typescript
import { CexQuote } from '../types';

export async function getNewExchangeQuote(symbol: string): Promise<CexQuote> {
  const start = performance.now();
  // ... fetch from the exchange API ...
  const latencyMs = Math.round(performance.now() - start);

  return {
    symbol,
    bidPrice: /* ... */,
    bidQty:   /* ... */,
    askPrice: /* ... */,
    askQty:   /* ... */,
    midPrice: (bidPrice + askPrice) / 2,
    spread:   askPrice - bidPrice,
    spreadPct: (spread / midPrice) * 100,
    latencyMs,
  };
}
```

2. Add the source to `CexSourceName` (`src/store/state.types.ts`):
```typescript
export type CexSourceName = 'binance' | 'mexc' | ... | 'newexchange';
```

3. Register in `cexConfigs` (`src/jobs/getCexQuotes/getCexQuotes.ts`):
```typescript
const cexConfigs: Record<CexSourceName, CexConfig> = {
  // ...existing...
  newexchange: { fetchQuote: getNewExchangeQuote, defaultSymbol: 'ETHUSDT' },
};
```

4. Add the source to `QuoteSourceName` (`src/jobs/shared/types.ts`):
```typescript
export type QuoteSourceName = ... | 'newexchange';
```

5. Add a bot rule to `BotList10` (`src/store/stabs/bots-list.stabs.ts`):
```typescript
{
  id: 'NewExchange_USDT_WETH',
  botParams: {
    botType: IBotType.TEST_BOT,
    paused: false,
    isRepeat: true,
    delayBetweenRepeat: 200,
    maxJobs: 1000000,
    maxErrors: 100,
    timeoutMs: 30000,
  },
  jobParams: {
    jobType: IJobType.GET_CEX_QUOTES,
    source: 'newexchange',
    symbol: 'ETHUSDT',
  },
}
```

### 10.2 New DEX Source (Different Network)

1. Create an analogue of `getDexQuotes` in `src/jobs/` for the new network.
2. Add a new `IJobType` and its handler in `src/jobs/handlers.ts`.
3. Use the `dexToUnified()` adapter (or create a custom one).
4. Call `marketDataClient.writeQuote(unified)` to forward data to arbiDexMarketData.

---

## 11. Key Token Addresses (Arbitrum One)

| Token | Address | Decimals |
|---|---|---|
| USDC | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 |
| USDT | `0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9` | 6 |
| WETH | `0x82af49447d8a07e3bd95bd0d56f35241523fbab1` | 18 |
| WBTC | `0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f` | 8 |
| ARB  | `0x912CE59144191C1204E64559FE8253a0e49E6548` | 18 |
| DAI  | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` | 18 |

Full list: `src/store/stabs/tokens.stabs.ts`.

---

## 12. Contracts (Arbitrum One)

| Contract | Address | Purpose |
|---|---|---|
| ArbQuoter | `0xb8C793ea9201b0875BEc927585Ca101D8A142E7F` | On-chain quoting: `quoteExactInBatch(steps[], amountIn)` |
| ArbExecutor | `0x4ffDddC895719C3f662364e79f989C4deea44118` | Executes arbitrage trades |
| ConfigStore | `0xfcB158cf91994c31D61e3F7358B5273c8e6729bD` | On-chain configuration storage |

Contract ABIs: `src/artifacts/contracts/`

---

## 13. Default Bot Configuration (BotList10)

Seven bots are started on server launch:

| ID | Type | Source | Symbol | Delay (ms) |
|---|---|---|---|---|
| `Binance_USDC_WETH` | CEX | binance | ETHUSDC | 200 |
| `Mexc_USDT_WETH` | CEX | mexc | ETHUSDT | 200 |
| `Bybit_USDT_WETH` | CEX | bybit | ETHUSDT | 200 |
| `OKX_USDT_WETH` | CEX | okx | ETH-USDT | 200 |
| `KuCoin_USDT_WETH` | CEX | kucoin | ETH-USDT | 200 |
| `GateIO_USDT_WETH` | CEX | gateio | ETH_USDT | 200 |
| `Arbitrum_USDC_WETH` | DEX | dex:arbitrum | WETH/USDC | 500 |

The DEX bot queries 13 pools (Uniswap V3, SushiSwap V3, PancakeSwap V3, Camelot V3).

---

## 14. Example: Full Arbitrage Detection Cycle

```typescript
// Author: Aliaksei Razhnou

// 1. Get all available keys
const keysRes = await fetch('http://45.135.182.251:3002/store/keys');
const keys: string[] = await keysRes.json();

// 2. Get latest point for every key (snapshot)
const snapRes = await fetch('http://45.135.182.251:3002/store/snapshot');
const snap: Record<string, { t: number; v: number }> = await snapRes.json();

let bestBid = { source: '', value: 0 };
let bestAsk = { source: '', value: Infinity };

for (const key of keys) {
  const point = snap[key];
  if (!point) continue;

  if (key.endsWith('|bidPrice') && point.v > bestBid.value) {
    bestBid = { source: key, value: point.v };
  }
  if (key.endsWith('|askPrice') && point.v < bestAsk.value) {
    bestAsk = { source: key, value: point.v };
  }
}

// 3. Check for arbitrage
if (bestBid.value > bestAsk.value) {
  const profitPct = ((bestBid.value - bestAsk.value) / bestAsk.value) * 100;
  console.log(
    `🔥 Arbitrage: buy on ${bestAsk.source} @ ${bestAsk.value}, ` +
    `sell on ${bestBid.source} @ ${bestBid.value} (+${profitPct.toFixed(4)}%)`
  );
}
```

---

## 15. Limitations and Notes

1. **Stateless collector** — arbiDexServerBots itself does not store price history. All data is forwarded to arbiDexMarketData.
2. **Single WebSocket** — `MarketDataClient` maintains one persistent connection per process. All jobs share it.
3. **Graceful degradation** — if `MARKET_DATA_URL` is not set or arbiDexMarketData is unreachable, jobs continue running; Socket.IO auto-reconnects silently in the background.
4. **Deduplication** — performed on the arbiDexMarketData side: if the value is unchanged, no new point is written.
5. **Timeout** — default 30 000 ms per job. If a job does not respond — `TIMEOUT` error.
6. **CORS** — enabled (`app.enableCors()`).
7. **Symbol formats** — each exchange has its own format (ETHUSDC, ETH-USDT, ETH\_USDT). Keys forwarded to arbiDexMarketData preserve the source's original symbol format.
8. **DEX prices** — depend on `tokenPair.tokenIn.amount` and `tokenPair.tokenOut.amount` (trade size affects slippage). Default: 100 USDC to buy, 0.03 WETH to sell.

---

## 16. Quick Start

```bash
# 1. Clone and configure
cd arbiDexServerBots
cp .env.example .env   # fill in the variables, set MARKET_DATA_URL
npm install

# 2. Start the server
npm run start

# 3. Verify data is flowing into arbiDexMarketData (after ~1–2 seconds)
curl http://45.135.182.251:3002/store/keys

# 4. Get current snapshot (latest point per key)
curl http://45.135.182.251:3002/store/snapshot

# 5. Subscribe to real-time updates via WebSocket
# → see examples in sections 5.4 / 8.2
```

---

## Author

**Aliaksei Razhnou**
