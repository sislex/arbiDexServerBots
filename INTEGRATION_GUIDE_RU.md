# 🤖 Инструкция по интеграции с arbiDexServerBots

> **Автор:** Aliaksei Razhnou  
> Документ предназначен для AI-агентов и разработчиков, которые хотят программно
> взаимодействовать с сервером котировок **arbiDexServerBots**.

---

## 1. Обзор проекта

**arbiDexServerBots** — NestJS-сервер (TypeScript), который:

1. Параллельно собирает котировки **bid/ask** из **6 CEX-бирж** (Binance, MEXC, Bybit, OKX, KuCoin, Gate.io) и **1 DEX-источника** (Arbitrum on-chain через контракт `ArbQuoter`).
2. Приводит все котировки к **единому формату** `UnifiedQuoteResult`.
3. Передаёт каждую котировку в **arbiDexMarketData** — внешний микросервис хранения временных рядов — через единое постоянное **WebSocket**-соединение (Socket.IO).
4. Предоставляет **REST API** для управления ботами, просмотра статуса и конфигурации.

### Стек

| Компонент | Технология |
|---|---|
| Фреймворк | NestJS 11 |
| Язык | TypeScript (strict) |
| Blockchain | ethers.js v6, viem v2 (Arbitrum One) |
| WebSocket | Socket.IO (через `@nestjs/websockets`) |
| Хранилище котировок | arbiDexMarketData (Socket.IO клиент) |
| Контейнеризация | Docker / docker-compose |

---

## 2. Запуск

```bash
# Установка зависимостей
npm install

# Запуск (development)
npm run start          # слушает на порту 3000

# Запуск (watch mode)
npm run start:dev

# Запуск в Docker
npm run start:docker   # docker-compose up --build -d, порт 1001 → 3000
```

### Переменные окружения (`.env`)

| Переменная | Описание |
|---|---|
| `PRIVATE_KEY` | Приватный ключ кошелька (hex) |
| `ARBITRUM_ALCHEMY_RPC` | RPC-эндпоинт Alchemy для Arbitrum One |
| `ARBITRUM_RPC` | Публичный RPC Arbitrum |
| `QUOTER_ADDRESS` | Адрес контракта `ArbQuoter` (on-chain quoter) |
| `EXECUTOR_ADDRESS` | Адрес контракта `ArbExecutor` |
| `CONFIG_STORE_ADDRESS` | Адрес контракта ConfigStore |
| `CALLER_ADDRESS` | Адрес вызывающего |
| `PORT` | Порт HTTP-сервера (по умолчанию `3000`) |
| `MARKET_DATA_URL` | URL arbiDexMarketData (напр. `http://45.135.182.251:3002`) |
| `MARKET_DATA_API_KEY` | API-ключ для arbiDexMarketData (пустой = auth отключён) |

---

## 3. Документация API (Swagger / OpenAPI)

**Swagger UI:** `http://localhost:3000/api` — интерактивный интерфейс для изучения и тестирования API.  
**OpenAPI JSON:** `http://localhost:3000/api-json` — машиночитаемая спецификация для AI-агентов и генераторов кода.

Все эндпоинты полностью задокументированы: описания, параметры, схемы запросов/ответов и примеры. AI-агенты могут получить `http://localhost:3000/api-json` для автоматического обнаружения API.

---

## 4. REST API

**Базовый URL:** `http://localhost:3000`

### 4.1 Системная информация

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/info` | Версия, время старта, кол-во ботов |
| `GET` | `/info/bots-types-list` | Список типов ботов |
| `GET` | `/info/apis` | Все зарегистрированные API-эндпоинты |
| `GET` | `/info/job-type-list` | Список типов джоб |
| `GET` | `/store` | Полный snapshot состояния приложения |

### 4.2 Управление ботами

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/bots/get-all` | Список всех ботов (id, params) |
| `GET` | `/bot/:botId/params` | Параметры конкретного бота |
| `GET` | `/bot/:botId/settings` | Настройки бота (botParams + jobParams) |
| `PUT` | `/bot/:botId/settings` | Обновить настройки. Body: `{ botParams: string(JSON), jobParams: string(JSON) }` |
| `GET` | `/bot/:botId/errors` | Список ошибок бота |
| `POST` | `/bot/:botId/pause` | Пауза/снятие. Body: `{ pause: boolean }` |
| `POST` | `/bot/:botId/restart` | Перезапуск бота |
| `GET` | `/bot/:botId/arbitrage` | Список арбитражных результатов |
| `POST` | `/setBotsRulesList` | Перезаписать полный список правил ботов. Body: `{ botsRulesList: IBotsRule[] }` |

### 4.3 Ошибки

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/errors` | Список всех ошибок |
| `DELETE` | `/errors` | Очистить ошибки |

---

## 5. Рыночные данные — arbiDexMarketData

Все ценовые данные, собранные arbiDexServerBots, передаются в микросервис **arbiDexMarketData**
в реальном времени. arbiDexMarketData — единственный источник истины для рыночных данных.

- **Развёрнут по адресу:** `http://45.135.182.251:3002`
- **Swagger UI:** `http://45.135.182.251:3002/api`
- **OpenAPI JSON:** `http://45.135.182.251:3002/api-json`

### 5.1 Формат ключа

```
<source>|<symbol>|<bidPrice|askPrice>
```

Примеры:
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

### 5.2 Формат точки данных

```typescript
interface DataPoint {
  t: number;  // timestamp (мс), Unix epoch — Date.now()
  v: number;  // числовое значение (цена)
}
```

### 5.3 Чтение данных через REST (arbiDexMarketData)

```bash
# Все доступные ключи
curl http://45.135.182.251:3002/store/keys

# Последняя точка по ключу
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice/latest"

# Серия с фильтрами (?limit=50 / ?from=мс&to=мс)
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?limit=50"

# Запрос по диапазону времени
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?from=1700000000000&to=1700000099000"

# Несколько ключей за раз
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

#### Пример ответа `/store/key/:key`

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

> **Дедупликация:** если цена не изменилась — новая точка не записывается.
> Интервалы между точками определяют периоды стабильности цены.

### 5.4 Подписка на обновления в реальном времени (WebSocket)

**Namespace:** `/store`  
**URL:** `ws://45.135.182.251:3002/store`

```typescript
import { io } from 'socket.io-client';

const socket = io('http://45.135.182.251:3002/store');

socket.on('connect', () => {
  // Подписка на конкретные ключи
  socket.emit('subscribe', {
    keys: [
      'binance|ETHUSDC|bidPrice',
      'binance|ETHUSDC|askPrice',
      'dex:arbitrum|WETH/USDC|bidPrice',
    ]
  });

  // Или подписка на ВСЕ ключи
  socket.emit('subscribe', {});
});

socket.on('dataChange', ({ key, point }) => {
  // point = { t: <unix_ms>, v: <цена> }
  console.log(`${key} = ${point.v} @ ${new Date(point.t).toISOString()}`);
});

socket.on('subscribed', (info) => {
  console.log('Подписка:', info); // { keys: [...] } или { keys: 'all' }
});
```

#### Справочник событий WebSocket

| Клиент → Сервер | Payload | Описание |
|---|---|---|
| `subscribe` | `{ keys?: string[] }` | Подписка. Без `keys` / пустой массив = подписка на всё |
| `unsubscribe` | — | Отмена всех подписок |

| Сервер → Клиент | Payload | Описание |
|---|---|---|
| `subscribed` | `{ keys: string[] \| 'all' }` | Подтверждение подписки |
| `unsubscribed` | `{}` | Подтверждение отписки |
| `dataChange` | `{ key: string, point: DataPoint }` | Новая точка данных по ключу |

### 5.5 Пример Python-клиента

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

## 6. Ключевые типы данных

### 6.1 UnifiedQuoteResult

Все 7 источников котировок приводятся к этому формату:

```typescript
interface UnifiedQuoteResult {
  sourceType: 'cex' | 'dex';
  source: QuoteSourceName;   // 'binance' | 'mexc' | 'bybit' | 'okx' | 'kucoin' | 'gateio' | 'dex:arbitrum'
  symbol: string;            // "ETHUSDC", "ETH-USDT", "WETH/USDC" и т.д.
  ok: boolean;
  latencyMs: number;
  error?: string;
  timestamp: number;         // Date.now()

  // Цены
  bidPrice: number;          // лучшая цена покупателя (bid) — продать базовый актив по ней
  askPrice: number;          // лучшая цена продавца (ask) — купить базовый актив по ней
  midPrice: number;          // (bid + ask) / 2
  spread: number;            // ask − bid
  spreadPct: number;         // spread / midPrice × 100

  // CEX-специфичные
  bidQty?: number;
  askQty?: number;

  // DEX-специфичные
  blockNumber?: number;
  gasUsed?: string;
  poolsCount?: number;
  bestBuyPool?: PoolBrief | null;
  bestSellPool?: PoolBrief | null;
}
```

### 6.2 Семантика bid/ask

| Термин | Значение | Пример (ETH/USDC) |
|---|---|---|
| `bidPrice` | По этой цене можно **ПРОДАТЬ** базовый актив (ETH) | 2049.20 USDC |
| `askPrice` | По этой цене можно **КУПИТЬ** базовый актив (ETH) | 2049.80 USDC |

Для **CEX**: `bidPrice` = лучший bid стакана, `askPrice` = лучший ask стакана.  
Для **DEX**: `bidPrice` = bestSellPrice (цена продажи ETH), `askPrice` = bestBuyPrice (цена покупки ETH).

### 6.3 IBotsRule (конфигурация бота)

```typescript
interface IBotsRule {
  id: string;              // уникальный ID, напр. "Binance_USDC_WETH"
  botParams: IBotParams;
  jobParams: IJobParams;   // зависит от jobType
}

interface IBotParams {
  botType: 'TestBot';
  paused: boolean;
  isRepeat: boolean;
  delayBetweenRepeat?: number;  // мс между повторами
  maxJobs: number;
  maxErrors?: number;
  maxArbitrage?: number;
  timeoutMs?: number;           // таймаут на 1 джобу (мс)
}
```

### 6.4 Типы джоб (IJobType)

| JobType | Описание | Ключевые поля jobParams |
|---|---|---|
| `get_Cex_Quotes` | CEX-котировка | `source`: `CexSourceName`, `symbol?` |
| `get_Dex_Quotes_By_Arb_Quoter` | DEX on-chain квотирование | `source`, `rpcUrl`, `pairsToQuote: IPool[]`, `symbol?` |
| `get_Pool_State` | Состояние пула (тики) | `rpcUrl`, `poolAddress`, `wordsAround`, `maxTicks` |
| `get_Executor_Balances` | Балансы ArbExecutor | `rpcUrl?`, `executorAddress?` |
| `getArbExecutorQuotes` | Котировки через ArbExecutor | `rpcUrl`, `pairsToQuote: IQuote[]` |

### 6.5 IPool (DEX-пул)

```typescript
interface IPool {
  dex: 'uniswap' | 'sushi' | 'pancake' | 'camelot';
  version: 'v2' | 'v3';
  poolAddress: string;     // 0x...
  token0: Address;         // 0x...
  token1: Address;         // 0x...
  feePpm?: number;         // Fee в ppm (100 = 0.01%, 500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
}

type Address = `0x${string}`;
```

### 6.6 CEX Source → Default Symbol

| Source | Default Symbol | Формат |
|---|---|---|
| `binance` | `ETHUSDC` | `BASEQUOTE` |
| `mexc` | `ETHUSDT` | `BASEQUOTE` |
| `bybit` | `ETHUSDT` | `BASEQUOTE` |
| `okx` | `ETH-USDT` | `BASE-QUOTE` |
| `kucoin` | `ETH-USDT` | `BASE-QUOTE` |
| `gateio` | `ETH_USDT` | `BASE_QUOTE` |

---

## 7. Архитектура проекта

> **Автор:** Aliaksei Razhnou

```
src/
├── main.ts                          # Точка входа, NestJS bootstrap, порт 3000
├── app.module.ts                    # Root module
│
├── controllers/
│   ├── app.controller.ts            # /info, /rules, /getPoolsByFactory
│   ├── bots.controller.ts           # /bots/*, /bot/:id/*
│   ├── store.controller.ts          # /store (полный snapshot состояния)
│   └── ui-errors.controller.ts      # /errors
│
├── store/                           # Redux-like store (BehaviorSubject + reducer)
│   ├── app.store.ts                 # AppStore (Injectable)
│   ├── state.types.ts               # Все интерфейсы и enum'ы
│   ├── reducer.ts                   # Reducer + initialState
│   ├── actions.ts                   # Action-типы
│   ├── selectors.ts                 # Селекторы
│   └── stabs/
│       ├── bots-list.stabs.ts       # BotList10 — конфигурация 7 ботов (6 CEX + 1 DEX)
│       └── tokens.stabs.ts          # Константы токенов (USDC, WETH, ...)
│
├── bots/
│   ├── bot-factory.ts               # Фабрика ботов
│   ├── bot-runner.service.ts        # Запуск ботов по botsRulesList
│   └── test/testBot.ts              # TestBot — универсальный бот (цикл + джоба)
│
├── jobs/
│   ├── handlers.ts                  # Маршрутизация jobType → handler-функция
│   ├── getCexQuotes/                # Единая CEX-джоба для всех 6 бирж
│   │   ├── getCexQuotes.ts
│   │   ├── types.ts
│   │   └── helpers/                 # getBinanceQuote, getMexcQuote, ...
│   ├── getDexQuotesByArbQuoter/     # DEX-квотирование через ArbQuoter
│   │   ├── getDexQuotesByArbQuoter.ts
│   │   └── helpers/                 # fetchBuySellQuotes, calculateQuotes, ...
│   └── shared/                      # Общие утилиты
│       ├── types.ts                 # UnifiedQuoteResult, PoolBrief, ...
│       ├── market-data-client.ts    # MarketDataClient — WebSocket-клиент для arbiDexMarketData
│       ├── printUnifiedQuotesTable.ts
│       ├── adapters/
│       │   ├── cexToUnified.ts      # CEX → UnifiedQuoteResult
│       │   └── dexToUnified.ts      # DEX → UnifiedQuoteResult
│       └── index.ts                 # Реэкспорт
│
├── helpers/                         # Утилиты (dex.constants, address-хелперы, ...)
├── arbitrage/                       # Логика поиска арбитража
├── swap/                            # Исполнение свопов on-chain
├── artifacts/                       # ABI контрактов (ArbQuoter, ArbExecutor, ...)
└── scripts/                         # Standalone-скрипты для ручного запуска
```

### Поток данных

```
┌─────────────────────────────────────────────────────────────┐
│                      BotRunnerService                        │
│  (читает botsRulesList, создаёт TestBot для каждого правила) │
└────────────────────┬────────────────────────────────────────┘
                     │ создаёт N ботов
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  TestBot (цикл)                                              │
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
│  In-memory хранилище временных рядов                         │
│  REST API  +  WebSocket подписки                             │
└─────────────────────────────────────────────────────────────┘
```

### MarketDataClient — Singleton WebSocket-клиент

`src/jobs/shared/market-data-client.ts`  
**Автор:** Aliaksei Razhnou

- **Lazy-singleton**: WebSocket-соединение создаётся при первом вызове `write()`.
- **Один сокет на весь процесс** — все джобы переиспользуют одно соединение.
- **Noop** если `MARKET_DATA_URL` не задан — ничего не падает, удобно для локальной разработки.
- **Авто-реконнект** средствами socket.io-client (`reconnectionAttempts: Infinity`).
- **Fire-and-forget**: `write()` синхронный, не ждёт ack.

```typescript
import { marketDataClient } from './jobs/shared';

// Записать одну точку
marketDataClient.write('binance|ETHUSDC|bidPrice', 2049.2, Date.now());

// Записать котировку (два write: bidPrice + askPrice)
marketDataClient.writeQuote(unifiedQuoteResult);

// Записать батч
marketDataClient.writeBatch([
  { key: 'binance|ETHUSDC|bidPrice', value: 2049.2 },
  { key: 'binance|ETHUSDC|askPrice', value: 2049.8 },
]);
```

---

## 8. Интеграция: Чтение рыночных данных

Все рыночные данные доступны через **arbiDexMarketData** по адресу `http://45.135.182.251:3002`.

### 8.1 Получить текущие лучшие цены (REST)

```bash
# 1. Узнать доступные ключи
curl http://45.135.182.251:3002/store/keys
# → ["binance|ETHUSDC|bidPrice","binance|ETHUSDC|askPrice","dex:arbitrum|WETH/USDC|bidPrice",...]

# 2. Последняя цена по ключу
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice/latest"
# → { "t": 1774548818034, "v": 2049.5 }

# 3. Серия — последние 50 точек
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?limit=50"

# 4. Запрос по диапазону времени
curl "http://45.135.182.251:3002/store/key/binance%7CETHUSDC%7CbidPrice?from=1700000000000&to=1700000099000"

# 5. Несколько ключей за раз
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

### 8.2 Подписка на обновления в реальном времени (WebSocket)

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

## 9. Интеграция: Управление ботами

### 9.1 Программный перезапуск с новыми правилами

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

### 9.2 Пауза / перезапуск бота

```bash
# Поставить на паузу
curl -X POST http://localhost:3000/bot/Binance_USDC_WETH/pause \
  -H 'Content-Type: application/json' \
  -d '{"pause": true}'

# Снять с паузы
curl -X POST http://localhost:3000/bot/Binance_USDC_WETH/pause \
  -H 'Content-Type: application/json' \
  -d '{"pause": false}'

# Перезапуск
curl -X POST http://localhost:3000/bot/Binance_USDC_WETH/restart
```

---

## 10. Интеграция: Добавление нового источника котировок

> **Автор:** Aliaksei Razhnou

### 10.1 Новый CEX-источник

1. Создать `src/jobs/getCexQuotes/helpers/getNewExchangeQuote.ts`:

```typescript
import { CexQuote } from '../types';

export async function getNewExchangeQuote(symbol: string): Promise<CexQuote> {
  const start = performance.now();
  // ... fetch из API биржи ...
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

2. Добавить source в `CexSourceName` (`src/store/state.types.ts`):
```typescript
export type CexSourceName = 'binance' | 'mexc' | ... | 'newexchange';
```

3. Зарегистрировать в `cexConfigs` (`src/jobs/getCexQuotes/getCexQuotes.ts`):
```typescript
const cexConfigs: Record<CexSourceName, CexConfig> = {
  // ...existing...
  newexchange: { fetchQuote: getNewExchangeQuote, defaultSymbol: 'ETHUSDT' },
};
```

4. Добавить source в `QuoteSourceName` (`src/jobs/shared/types.ts`):
```typescript
export type QuoteSourceName = ... | 'newexchange';
```

5. Добавить правило бота в `BotList10` (`src/store/stabs/bots-list.stabs.ts`):
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

### 10.2 Новый DEX-источник (другая сеть)

1. Создать аналог `getDexQuotes` в `src/jobs/` для новой сети.
2. Добавить новый `IJobType` и handler в `src/jobs/handlers.ts`.
3. Использовать `dexToUnified()` адаптер (или создать аналог).
4. Вызывать `marketDataClient.writeQuote(unified)` для передачи данных в arbiDexMarketData.

---

## 11. Ключевые адреса токенов (Arbitrum One)

| Токен | Адрес | Decimals |
|---|---|---|
| USDC | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 |
| USDT | `0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9` | 6 |
| WETH | `0x82af49447d8a07e3bd95bd0d56f35241523fbab1` | 18 |
| WBTC | `0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f` | 8 |
| ARB  | `0x912CE59144191C1204E64559FE8253a0e49E6548` | 18 |
| DAI  | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` | 18 |

Полный список: `src/store/stabs/tokens.stabs.ts`.

---

## 12. Контракты (Arbitrum One)

| Контракт | Адрес | Назначение |
|---|---|---|
| ArbQuoter | `0xb8C793ea9201b0875BEc927585Ca101D8A142E7F` | On-chain квотирование: `quoteExactInBatch(steps[], amountIn)` |
| ArbExecutor | `0x4ffDddC895719C3f662364e79f989C4deea44118` | Исполнение арбитражных сделок |
| ConfigStore | `0xfcB158cf91994c31D61e3F7358B5273c8e6729bD` | Хранение конфигурации на chain |

ABI контрактов: `src/artifacts/contracts/`

---

## 13. Текущая конфигурация ботов (BotList10)

При старте сервера запускаются 7 ботов:

| ID | Тип | Source | Symbol | Delay (мс) |
|---|---|---|---|---|
| `Binance_USDC_WETH` | CEX | binance | ETHUSDC | 200 |
| `Mexc_USDT_WETH` | CEX | mexc | ETHUSDT | 200 |
| `Bybit_USDT_WETH` | CEX | bybit | ETHUSDT | 200 |
| `OKX_USDT_WETH` | CEX | okx | ETH-USDT | 200 |
| `KuCoin_USDT_WETH` | CEX | kucoin | ETH-USDT | 200 |
| `GateIO_USDT_WETH` | CEX | gateio | ETH_USDT | 200 |
| `Arbitrum_USDC_WETH` | DEX | dex:arbitrum | WETH/USDC | 500 |

DEX-бот опрашивает 13 пулов (Uniswap V3, SushiSwap V3, PancakeSwap V3, Camelot V3).

---

## 14. Пример: Полный цикл обнаружения арбитража

```typescript
// Автор: Aliaksei Razhnou

// 1. Получить все доступные ключи
const keysRes = await fetch('http://45.135.182.251:3002/store/keys');
const keys: string[] = await keysRes.json();

// 2. Получить последнюю точку по каждому ключу (snapshot)
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

// 3. Проверить арбитраж
if (bestBid.value > bestAsk.value) {
  const profitPct = ((bestBid.value - bestAsk.value) / bestAsk.value) * 100;
  console.log(
    `🔥 Арбитраж: купить на ${bestAsk.source} по ${bestAsk.value}, ` +
    `продать на ${bestBid.source} по ${bestBid.value} (+${profitPct.toFixed(4)}%)`
  );
}
```

---

## 15. Ограничения и особенности

1. **Stateless-коллектор** — arbiDexServerBots сам не хранит историю цен. Все данные передаются в arbiDexMarketData.
2. **Один WebSocket** — `MarketDataClient` поддерживает одно постоянное соединение на процесс. Все джобы его разделяют.
3. **Graceful degradation** — если `MARKET_DATA_URL` не задан или arbiDexMarketData недоступен, джобы продолжают работать; Socket.IO автоматически переподключается в фоне.
4. **Дедупликация** — выполняется на стороне arbiDexMarketData: если значение не изменилось, новая точка не записывается.
5. **Таймаут** — по умолчанию 30 000 мс на джобу. Если джоба не ответила — ошибка `TIMEOUT`.
6. **CORS** — включён (`app.enableCors()`).
7. **Формат символов** — у каждой биржи свой формат (ETHUSDC, ETH-USDT, ETH\_USDT). Ключи в arbiDexMarketData сохраняют оригинальный формат символа источника.
8. **DEX цены** — зависят от `tokenPair.tokenIn.amount` и `tokenPair.tokenOut.amount` (размер сделки влияет на slippage). По умолчанию: 100 USDC на покупку, 0.03 WETH на продажу.

---

## 16. Быстрый старт

```bash
# 1. Клонировать и настроить
cd arbiDexServerBots
cp .env.example .env   # заполнить переменные, указать MARKET_DATA_URL
npm install

# 2. Запустить сервер
npm run start

# 3. Проверить что данные поступают в arbiDexMarketData (через ~1–2 секунды)
curl http://45.135.182.251:3002/store/keys

# 4. Получить текущий snapshot (последняя точка по каждому ключу)
curl http://45.135.182.251:3002/store/snapshot

# 5. Подписаться на обновления в реальном времени через WebSocket
# → см. примеры в разделах 5.4 / 8.2
```

---

## Автор

**Aliaksei Razhnou**
