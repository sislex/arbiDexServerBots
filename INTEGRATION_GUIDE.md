# 🤖 Инструкция по интеграции с arbiDexServerBots

> Документ предназначен для AI-агентов / разработчиков, которые хотят программно
> взаимодействовать с сервером котировок arbiDexServerBots.

---

## 1. Обзор проекта

**arbiDexServerBots** — NestJS-сервер (TypeScript), который:

1. Параллельно собирает котировки **bid/ask** из **6 CEX-бирж** (Binance, MEXC, Bybit, OKX, KuCoin, Gate.io) и **1 DEX-источника** (Arbitrum on-chain через контракт `ArbQuoter`).
2. Приводит все котировки к **единому формату** `UnifiedQuoteResult`.
3. Сохраняет историю цен в in-memory хранилище `PriceStore` (до 100 000 точек на ключ).
4. Предоставляет **REST API** и **WebSocket** для чтения текущих и исторических цен и подписки на обновления в реальном времени.

### Стек

| Компонент | Технология |
|---|---|
| Фреймворк | NestJS 11 |
| Язык | TypeScript (strict) |
| Blockchain | ethers.js v6, viem v2 (Arbitrum One) |
| WebSocket | Socket.IO (через `@nestjs/websockets`) |
| Контейнеризация | Docker / docker-compose |

---

## 2. Запуск

```bash
# Установка зависимостей
npm install

# Запуск сервера (development)
npm run start          # слушает на порту 3000

# Запуск сервера (watch mode)
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

---

## 3. REST API

Базовый URL: `http://localhost:3000`

### 3.1 Системная информация

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/info` | Версия, время старта, кол-во ботов |
| `GET` | `/info/bots-types-list` | Список типов ботов |
| `GET` | `/info/apis` | Список всех зарегистрированных API-эндпоинтов |
| `GET` | `/info/job-type-list` | Список типов джоб |
| `GET` | `/store` | Полный snapshot состояния приложения |

### 3.2 Управление ботами

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

### 3.3 Ошибки

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/errors` | Список всех ошибок |
| `DELETE` | `/errors` | Очистить ошибки |

### 3.4 Цены (PriceStore)

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/prices/keys` | Все ключи, по которым есть данные |
| `GET` | `/prices/all` | Все данные по всем ключам |
| `GET` | `/prices/key/:key` | Серия точек по одному ключу |
| `POST` | `/prices/keys` | Серии по списку ключей. Body: `{ keys: string[] }` |

#### Формат ключа PriceStore

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

#### Формат точки (PricePoint)

```typescript
interface PricePoint {
  t: number;  // timestamp (ms), Unix epoch
  v: number;  // value (цена)
}
```

#### Пример запроса

```bash
# Все ключи
curl http://localhost:3000/prices/keys

# Серия по ключу
curl http://localhost:3000/prices/key/binance%7CETHUSDC%7CbidPrice

# Несколько ключей
curl -X POST http://localhost:3000/prices/keys \
  -H 'Content-Type: application/json' \
  -d '{"keys":["binance|ETHUSDC|bidPrice","dex:arbitrum|WETH/USDC|askPrice"]}'
```

#### Пример ответа `/prices/key/:key`

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

> **Дедупликация:** если цена не изменилась, новая точка не записывается.
> Интервалы между точками определяют время, когда цена оставалась неизменной.

---

## 4. WebSocket API (Socket.IO)

**Namespace:** `/prices`  
**URL:** `ws://localhost:3000/prices`

### 4.1 С использованием socket.io-client

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/prices');

// Подписка на конкретные ключи
socket.emit('subscribe', {
  keys: [
    'binance|ETHUSDC|bidPrice',
    'binance|ETHUSDC|askPrice',
    'dex:arbitrum|WETH/USDC|bidPrice',
  ]
});

// Подписка на ВСЕ ключи
socket.emit('subscribe', {});

// Получение обновлений
socket.on('priceChange', (data: { key: string; point: { t: number; v: number } }) => {
  console.log(`${data.key} → ${data.point.v} @ ${new Date(data.point.t).toISOString()}`);
});

// Подтверждение подписки
socket.on('subscribed', (info) => {
  console.log('Subscribed:', info);  // { keys: [...] } или { keys: 'all' }
});

// Отписка
socket.emit('unsubscribe');
```

### 4.2 Без socket.io-client (raw WebSocket — Engine.IO протокол)

Socket.IO использует собственный протокол поверх WebSocket. Для прямого подключения
необходимо использовать Engine.IO handshake:

```
1. GET http://localhost:3000/prices/socket.io/?EIO=4&transport=polling
   → получить sid

2. WS  ws://localhost:3000/prices/socket.io/?EIO=4&transport=websocket&sid=<sid>
   → отправить: 40                          (Socket.IO connect к namespace)
   → получить: 40{"sid":"..."}              (подтверждение)

3. Отправить subscribe:
   42["subscribe",{"keys":["binance|ETHUSDC|bidPrice"]}]

4. Получить:
   42["priceChange",{"key":"binance|ETHUSDC|bidPrice","point":{"t":1774548817787,"v":2049.2}}]
```

> **Рекомендация:** используйте socket.io-client — он доступен для JS/TS, Python, Java, Go.

### 4.3 События

| Клиент → Сервер | Payload | Описание |
|---|---|---|
| `subscribe` | `{ keys?: string[] }` | Подписка на ключи. Если `keys` пуст/отсутствует — подписка на всё |
| `unsubscribe` | — | Отписка от всех ключей |

| Сервер → Клиент | Payload | Описание |
|---|---|---|
| `subscribed` | `{ keys: string[] \| 'all' }` | Подтверждение подписки |
| `unsubscribed` | `{}` | Подтверждение отписки |
| `priceChange` | `{ key: string, point: PricePoint }` | Новая цена по ключу |

---

## 5. Ключевые типы данных

### 5.1 UnifiedQuoteResult

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
  bidPrice: number;          // лучшая цена покупателя (bid) — продать по ней
  askPrice: number;          // лучшая цена продавца (ask)  — купить по ней
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

### 5.2 Семантика bid/ask

| Термин | Значение | Пример (ETH/USDC) |
|---|---|---|
| `bidPrice` | По этой цене можно **ПРОДАТЬ** базовый актив (ETH) | 2049.20 USDC |
| `askPrice` | По этой цене можно **КУПИТЬ** базовый актив (ETH) | 2049.80 USDC |

Для **CEX**: `bidPrice` = лучший bid стакана, `askPrice` = лучший ask стакана.  
Для **DEX**: `bidPrice` = bestSellPrice (цена продажи ETH), `askPrice` = bestBuyPrice (цена покупки ETH).

### 5.3 IBotsRule (конфигурация бота)

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
  timeoutMs?: number;           // таймаут на 1 джобу
}
```

### 5.4 Типы джоб (IJobType)

| JobType | Описание | Ключевые поля jobParams |
|---|---|---|
| `get_Cex_Quotes` | CEX-котировка | `source`: `CexSourceName`, `symbol?` |
| `get_Dex_Quotes_By_Arb_Quoter` | DEX on-chain квотирование | `source`, `rpcUrl`, `pairsToQuote: IPool[]`, `symbol?` |
| `get_Pool_State` | Состояние пула | `rpcUrl`, `poolAddress`, `wordsAround`, `maxTicks` |
| `get_Executor_Balances` | Балансы ArbExecutor | `rpcUrl?`, `executorAddress?` |
| `getArbExecutorQuotes` | Котировки через ArbExecutor | `rpcUrl`, `pairsToQuote: IQuote[]` |

### 5.5 IPool (DEX-пул)

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

### 5.6 CEX Source → Default Symbol

| Source | Default Symbol | Формат |
|---|---|---|
| `binance` | `ETHUSDC` | `BASEQUOTE` |
| `mexc` | `ETHUSDT` | `BASEQUOTE` |
| `bybit` | `ETHUSDT` | `BASEQUOTE` |
| `okx` | `ETH-USDT` | `BASE-QUOTE` |
| `kucoin` | `ETH-USDT` | `BASE-QUOTE` |
| `gateio` | `ETH_USDT` | `BASE_QUOTE` |

---

## 6. Архитектура проекта

```
src/
├── main.ts                     # Точка входа, NestJS bootstrap, порт 3000
├── app.module.ts               # Root module
│
├── controllers/
│   ├── app.controller.ts       # /info, /prices/*, /rules, /getPoolsByFactory
│   ├── bots.controller.ts      # /bots/*, /bot/:id/*
│   ├── store.controller.ts     # /store (полный snapshot)
│   ├── price.gateway.ts        # WebSocket /prices namespace
│   └── ui-errors.controller.ts # /errors
│
├── store/                      # Redux-like store (BehaviorSubject + reducer)
│   ├── app.store.ts            # AppStore (Injectable)
│   ├── state.types.ts          # ВСЕ интерфейсы и enum'ы
│   ├── reducer.ts              # Reducer + initialState
│   ├── actions.ts              # Action-типы
│   ├── selectors.ts            # Селекторы
│   └── stabs/
│       ├── bots-list.stabs.ts  # BotList10 — конфигурация 7 ботов (6 CEX + 1 DEX)
│       └── tokens.stabs.ts     # Константы токенов (USDC, WETH, ...)
│
├── bots/
│   ├── bot-factory.ts          # Фабрика ботов
│   ├── bot-runner.service.ts   # Сервис запуска ботов по botsRulesList
│   ├── price-watcher.service.ts# Логирование изменений цен
│   └── test/testBot.ts         # TestBot — универсальный бот (loop + job)
│
├── jobs/
│   ├── handlers.ts             # Маршрутизация jobType → handler-функция
│   ├── getCexQuotes/           # Единая CEX-джоба для всех 6 бирж
│   │   ├── getCexQuotes.ts
│   │   ├── types.ts
│   │   └── helpers/            # getBinanceQuote, getMexcQuote, ...
│   ├── getDexQuotesByArbQuoter/# DEX-квотирование через ArbQuoter
│   │   ├── getDexQuotesByArbQuoter.ts
│   │   └── helpers/            # fetchBuySellQuotes, calculateQuotes, ...
│   └── shared/                 # Общие утилиты
│       ├── types.ts            # UnifiedQuoteResult, PoolBrief, ...
│       ├── priceStore.ts       # PriceStore — хранилище ценовых серий
│       ├── printUnifiedQuotesTable.ts
│       ├── adapters/
│       │   ├── cexToUnified.ts # CEX → UnifiedQuoteResult
│       │   └── dexToUnified.ts # DEX → UnifiedQuoteResult
│       └── index.ts            # Реэкспорт
│
├── helpers/                    # Утилиты (dex.constants, address-хелперы, ...)
├── arbitrage/                  # Логика поиска арбитража
├── swap/                       # Исполнение свопов on-chain
├── artifacts/                  # ABI контрактов (ArbQuoter, ArbExecutor, ...)
└── scripts/                    # Standalone-скрипты для ручного запуска
```

### Поток данных

```
┌────────────────────────────────────────────────────────┐
│                    BotRunnerService                     │
│  (читает botsRulesList, создаёт TestBot для каждого)    │
└────────────────┬───────────────────────────────────────┘
                 │ создаёт N ботов
                 ▼
┌────────────────────────────────────────────────────────┐
│  TestBot (loop)                                         │
│  ┌──────────────────────────────┐                       │
│  │ runJob(jobParams)            │  ← handlers.ts        │
│  │  → getCexQuotes(source)      │  или                  │
│  │  → getDexQuotesByArbQuoter() │                       │
│  └──────────┬───────────────────┘                       │
│             │ UnifiedQuoteResult                        │
│             ▼                                           │
│  priceStore.recordQuote(unified)                        │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  PriceStore (in-memory)                                 │
│  Map<key, PricePoint[]>                                 │
│  EventEmitter: change:<key>, change (any)               │
└────────┬──────────────────────┬────────────────────────┘
         │                      │
    REST API                WebSocket
    /prices/*             /prices namespace
```

---

## 7. Интеграция: Чтение котировок

### 7.1 Получить текущие лучшие цены (REST)

```bash
# 1. Узнать доступные ключи
curl http://localhost:3000/prices/keys
# → ["binance|ETHUSDC|bidPrice","binance|ETHUSDC|askPrice","dex:arbitrum|WETH/USDC|bidPrice",...]

# 2. Получить последнюю цену по ключу
curl http://localhost:3000/prices/key/binance%7CETHUSDC%7CbidPrice
# → { "key": "...", "last": { "t": 1774..., "v": 2049.2 }, "count": 42, "points": [...] }

# 3. Получить цены из нескольких источников разом
curl -X POST http://localhost:3000/prices/keys \
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

### 7.2 Подписка на обновления (WebSocket)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/prices');

socket.on('connect', () => {
  // Подписка только на Binance и DEX Arbitrum
  socket.emit('subscribe', {
    keys: [
      'binance|ETHUSDC|bidPrice',
      'binance|ETHUSDC|askPrice',
      'dex:arbitrum|WETH/USDC|bidPrice',
      'dex:arbitrum|WETH/USDC|askPrice',
    ]
  });
});

socket.on('priceChange', ({ key, point }) => {
  // point = { t: <unix_ms>, v: <price> }
  console.log(`${key} = ${point.v}`);
});
```

### 7.3 Пример Python-клиента

```python
import socketio

sio = socketio.Client()

@sio.on('priceChange', namespace='/prices')
def on_price_change(data):
    print(f"{data['key']} → {data['point']['v']}")

@sio.on('subscribed', namespace='/prices')
def on_subscribed(data):
    print(f"Subscribed: {data}")

sio.connect('http://localhost:3000', namespaces=['/prices'])
sio.emit('subscribe', {'keys': ['binance|ETHUSDC|bidPrice']}, namespace='/prices')
sio.wait()
```

---

## 8. Интеграция: Управление ботами

### 8.1 Программный перезапуск с новыми правилами

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

### 8.2 Пауза / перезапуск бота

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

## 9. Интеграция: Добавление нового источника котировок

### 9.1 Новый CEX-источник

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
    bidQty: /* ... */,
    askPrice: /* ... */,
    askQty: /* ... */,
    midPrice: (bidPrice + askPrice) / 2,
    spread: askPrice - bidPrice,
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
  botParams: { botType: IBotType.TEST_BOT, paused: false, isRepeat: true, delayBetweenRepeat: 200, maxJobs: 1000000, maxErrors: 100, timeoutMs: 30000 },
  jobParams: { jobType: IJobType.GET_CEX_QUOTES, source: 'newexchange', symbol: 'ETHUSDT' },
}
```

### 9.2 Новый DEX-источник (другая сеть)

1. Создать аналог `getDexQuotes` в `src/jobs/` для новой сети.
2. Добавить новый `IJobType` и handler в `src/jobs/handlers.ts`.
3. Использовать `dexToUnified()` адаптер (или создать аналог).
4. Вызывать `priceStore.recordQuote(unified)` для записи в PriceStore.

---

## 10. Ключевые адреса токенов (Arbitrum One)

| Токен | Адрес | Decimals |
|---|---|---|
| USDC | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 |
| USDT | `0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9` | 6 |
| WETH | `0x82af49447d8a07e3bd95bd0d56f35241523fbab1` | 18 |
| WBTC | `0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f` | 8 |
| ARB | `0x912CE59144191C1204E64559FE8253a0e49E6548` | 18 |
| DAI | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` | 18 |

Полный список — `src/store/stabs/tokens.stabs.ts`.

---

## 11. Контракты (Arbitrum One)

| Контракт | Адрес | Назначение |
|---|---|---|
| ArbQuoter | `0xb8C793ea9201b0875BEc927585Ca101D8A142E7F` | On-chain квотирование: `quoteExactInBatch(steps[], amountIn)` |
| ArbExecutor | `0x4ffDddC895719C3f662364e79f989C4deea44118` | Исполнение арбитражных сделок |
| ConfigStore | `0xfcB158cf91994c31D61e3F7358B5273c8e6729bD` | Хранение конфигурации на chain |

ABI контрактов: `src/artifacts/contracts/`

---

## 12. Текущая конфигурация ботов (BotList10)

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

## 13. Пример: Полный цикл получения арбитражной информации

```typescript
// 1. Получить все текущие цены
const keysRes = await fetch('http://localhost:3000/prices/keys');
const keys = await keysRes.json();

// 2. Найти лучший bid и ask
const allRes = await fetch('http://localhost:3000/prices/all');
const allData = await allRes.json();

let bestBid = { source: '', value: 0 };
let bestAsk = { source: '', value: Infinity };

for (const key of keys) {
  const last = allData[key]?.[allData[key].length - 1];
  if (!last) continue;
  
  if (key.endsWith('|bidPrice') && last.v > bestBid.value) {
    bestBid = { source: key, value: last.v };
  }
  if (key.endsWith('|askPrice') && last.v < bestAsk.value) {
    bestAsk = { source: key, value: last.v };
  }
}

// 3. Проверить арбитраж
if (bestBid.value > bestAsk.value) {
  const profitPct = ((bestBid.value - bestAsk.value) / bestAsk.value) * 100;
  console.log(`🔥 Арбитраж: купить на ${bestAsk.source} по ${bestAsk.value}, продать на ${bestBid.source} по ${bestBid.value} (+${profitPct.toFixed(4)}%)`);
}
```

---

## 14. Ограничения и особенности

1. **In-memory хранилище** — PriceStore хранит данные в памяти процесса. При перезапуске все ценовые серии теряются.
2. **Лимит точек** — по умолчанию 100 000 точек на ключ. При превышении удаляется самая старая точка (FIFO).
3. **Дедупликация** — одинаковые последовательные значения не записываются.
4. **Timeout** — по умолчанию 30 000 мс на джобу. Если джоба не ответила — ошибка `TIMEOUT`.
5. **CORS** — включён (`app.enableCors()`), WebSocket тоже с `cors: true`.
6. **Формат символов** — у каждой биржи свой формат (ETHUSDC, ETH-USDT, ETH_USDT). Ключи PriceStore содержат оригинальный формат символа источника.
7. **DEX цены** — зависят от `tokenPair.tokenIn.amount` и `tokenPair.tokenOut.amount` (размер запроса влияет на slippage). По умолчанию: 100 USDC на покупку, 0.03 WETH на продажу.

---

## 15. Быстрый старт для интеграции

```bash
# 1. Запустить сервер
cd arbiDexServerBots
cp .env.example .env   # настроить переменные
npm install
npm run start

# 2. Проверить что данные поступают (через ~1-2 секунды)
curl http://localhost:3000/prices/keys

# 3. Получить текущие цены
curl http://localhost:3000/prices/all

# 4. Подписаться на обновления через WebSocket
# → см. примеры в разделе 7.2 / 7.3
```

