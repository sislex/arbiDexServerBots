# arbiDexServerBots

> **Author:** Aliaksei Razhnou

Autonomous quote-collection server that gathers real-time **bid/ask** prices from 6 CEX exchanges and 1 DEX source (Arbitrum on-chain), normalises them into a unified format, and forwards everything to [arbiDexMarketData](http://45.135.182.251:3002/api) via a persistent WebSocket connection.

---

## Features

- **7 parallel bots** — Binance, MEXC, Bybit, OKX, KuCoin, Gate.io (CEX) + Arbitrum DEX (13 pools)
- **Unified quote format** — all sources normalised to `UnifiedQuoteResult` with bid/ask/mid/spread
- **Real-time forwarding** — single Socket.IO connection to arbiDexMarketData (fire-and-forget)
- **REST API** — bot management, pause/resume, live reconfiguration
- **Swagger UI** — interactive API explorer at `/api`
- **OpenAPI JSON** — machine-readable spec at `/api-json` for AI agents and code generators
- **Graceful degradation** — works without arbiDexMarketData; auto-reconnects in background
- **Docker** — ready for production deployment

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set MARKET_DATA_URL, PRIVATE_KEY, RPC endpoints (see table below)

# 3. Run
npm run start:dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Wallet private key (hex) |
| `ARBITRUM_ALCHEMY_RPC` | Alchemy RPC for Arbitrum One |
| `ARBITRUM_RPC` | Public Arbitrum RPC |
| `QUOTER_ADDRESS` | ArbQuoter contract address |
| `EXECUTOR_ADDRESS` | ArbExecutor contract address |
| `CONFIG_STORE_ADDRESS` | ConfigStore contract address |
| `CALLER_ADDRESS` | Caller address |
| `MARKET_DATA_URL` | arbiDexMarketData URL (e.g. `http://45.135.182.251:3002`) |
| `MARKET_DATA_API_KEY` | API key for arbiDexMarketData (empty = auth disabled) |

## Scripts

```bash
npm run start          # Development
npm run start:dev      # Watch mode
npm run start:prod     # Production (after build)
npm run build          # Compile TypeScript

npm test               # Unit tests
npm run test:cov       # Tests with coverage
npm run test:e2e       # End-to-end tests

npm run start:docker   # Docker Compose up
npm run "stop & clear:docker"  # Docker Compose down
```

## Architecture

```
BotRunnerService
  └── TestBot × 7
        ├── getCexQuotes(binance|mexc|bybit|okx|kucoin|gateio)
        └── getDexQuotesByArbQuoter(arbitrum, 13 pools)
              │
              ▼  UnifiedQuoteResult
        marketDataClient.writeQuote()
              │
              ▼  Socket.IO emit('write', {key, value, timestamp})
        arbiDexMarketData (http://45.135.182.251:3002)
```

All quotes flow through `MarketDataClient` — a lazy-singleton Socket.IO client that creates one shared connection on first use and auto-reconnects on failure.

## Local WebSocket Stream

This server also exposes its own real-time Socket.IO namespace at `/store`.
It is intended for local subscribers that want to receive fresh quotes directly from running bots without reading from `arbiDexMarketData`.

Important behavior:

- The stream is **ephemeral**: no persistence, no replay, no snapshot, no history.
- A client receives only **future** events that arrive after `subscribe`.
- The event contract is intentionally the same as in `arbiDexMarketData`, so the same client subscription logic can be reused.
- Quotes are still forwarded to `arbiDexMarketData`; the local stream is an additional fan-out, not a replacement.

### Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/store');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Subscribe to specific keys

```typescript
socket.emit('subscribe', {
  keys: [
    'binance|ETH/USDC|bidPrice',
    'dex:arbitrum|0x82af49447d8a07e3bd95bd0d56f35241523fbab1/0xaf88d065e77c8cc2239327c5edb3a432268e5831|askPrice',
  ],
});

socket.on('subscribed', (info) => {
  console.log(info.keys);
});

socket.on('dataChange', ({ key, point }) => {
  console.log(key, point);
});
```

### Subscribe to all future keys

```typescript
socket.emit('subscribe', {});
// or
socket.emit('subscribe', { keys: [] });
```

### Events

- `subscribe` -> client to server, payload `{ keys?: string[] }`
- `subscribed` -> server to client, payload `{ keys: string[] | 'all' }`
- `unsubscribe` -> client to server, no payload required
- `unsubscribed` -> server to client, payload `{}`
- `dataChange` -> server to client, payload `{ key, point }`

### Data format

Numeric quote update:

```ts
{ key: 'binance|ETH/USDC|bidPrice', point: { t: 1774548818034, v: 2049.5 } }
```

DEX pool metadata update:

```ts
{
  key: 'dex:arbitrum|TOKEN0/TOKEN1|askPool',
  point: {
    v: {
      dex: 'uniswap',
      version: 'v3',
      poolAddress: '0x...',
    },
  },
}
```

### Key rules

- Price keys: `<source>|<token0>/<token1>|bidPrice` and `<source>|<token0>/<token1>|askPrice`
- DEX pool keys: `<source>|<token0>/<token1>|bidPool` and `<source>|<token0>/<token1>|askPool`
- For `getDexQuotesByArbQuoterScript`, `token0` and `token1` are token addresses from `params.opts.tokenIn.address` and `params.opts.tokenOut.address`

## Market Data

All price data lives in **arbiDexMarketData**:

| Resource | URL |
|---|---|
| Swagger UI | http://45.135.182.251:3002/api |
| OpenAPI JSON | http://45.135.182.251:3002/api-json |
| WebSocket | `ws://45.135.182.251:3002/store` (Socket.IO namespace) |

### Key format

```
<source>|<symbol>|<bidPrice|askPrice>
```

Examples: `binance|ETHUSDC|bidPrice`, `dex:arbitrum|WETH/USDC|askPrice`

### Quick read

```bash
# All keys
curl http://45.135.182.251:3002/store/keys

# Latest price
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice/latest"

# Snapshot (all keys, latest point each)
curl http://45.135.182.251:3002/store/snapshot
```

### Real-time subscription

```typescript
import { io } from 'socket.io-client';

const socket = io('http://45.135.182.251:3002/store');
socket.on('connect', () => {
  socket.emit('subscribe', {
    keys: ['binance|ETHUSDC|bidPrice', 'dex:arbitrum|WETH/USDC|askPrice']
  });
});
socket.on('dataChange', ({ key, point }) => {
  console.log(`${key} = ${point.v}`);
});
```

## API Documentation

| Resource | URL |
|---|---|
| **Swagger UI** | `http://localhost:3000/api` |
| **OpenAPI JSON** | `http://localhost:3000/api-json` |

Swagger UI allows humans to explore and try all API endpoints interactively.  
OpenAPI JSON is a machine-readable spec for AI agents, code generators, and HTTP clients (Postman, Insomnia, etc.).

## REST API (this server)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/info` | Server info (version, uptime, bot count) |
| `GET` | `/bots/get-all` | List all bots |
| `GET` | `/bot/:id/settings` | Bot settings |
| `PUT` | `/bot/:id/settings` | Update bot settings |
| `POST` | `/bot/:id/pause` | Pause / resume (`{ pause: boolean }`) |
| `POST` | `/bot/:id/restart` | Restart a bot |
| `POST` | `/setBotsRulesList` | Replace all bot rules |
| `GET` | `/store` | Full application state |
| `GET` | `/errors` | Error list |
| `DELETE` | `/errors` | Clear errors |

## Project Structure

```
src/
├── main.ts                        # NestJS bootstrap
├── app.module.ts                  # Root module
├── controllers/                   # REST endpoints
├── bots/                          # Bot runner + TestBot
├── jobs/
│   ├── getCexQuotes/              # CEX quote fetchers (6 exchanges)
│   ├── getDexQuotesByArbQuoter/   # DEX on-chain quoting
│   └── shared/
│       ├── market-data-client.ts  # WebSocket client → arbiDexMarketData
│       ├── types.ts               # UnifiedQuoteResult
│       └── adapters/              # cexToUnified, dexToUnified
├── store/                         # Redux-like state (BehaviorSubject + reducer)
├── helpers/                       # Utilities
├── arbitrage/                     # Arbitrage detection
├── swap/                          # On-chain swap execution
└── artifacts/                     # Contract ABIs
```

## Tests

```bash
npm test
```

19 unit tests covering `MarketDataClient` (noop mode, lazy connect, write/writeQuote/writeBatch, disconnect, auto-connect).

## Documentation

Full integration guide with detailed API examples, data types, and architecture diagrams:

📖 **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**

## Tech Stack

| | |
|---|---|
| NestJS 11 | TypeScript (strict) |
| ethers.js v6 | viem v2 |
| Socket.IO | Jest |
| Docker | docker-compose |

## Author

**Aliaksei Razhnou**
