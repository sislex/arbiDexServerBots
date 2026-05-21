# getDexQuotesByArbQuoterScript

## Что это

Новая DEX job, которая повторяет контракт и сохранение текущей `getDexQuotesByArbQuoter`, но исполняет получение котировок по "скриптовой" логике (`quoteExactInWithImpact` + `buildStoreStep` с сетевыми роутерами).

## Отличия от текущей job

- Текущая job: использует существующий поток `fetchBuySellQuotes`.
- Эта job: строит `SwapStep` по подходу из скриптов `src/scripts/arbQuoter/networks/helpers`.

## Совместимость сохранения

Сохранение осталось таким же:

1. результат маппится в unified через `dexToUnified`
2. запись в market-data через `marketDataClient.writeQuote(...)`

## Использование

- `jobType`: `get_Dex_Quotes_By_Arb_Quoter_Script`
- Входные поля совместимы с `get_Dex_Quotes_By_Arb_Quoter`:
  - `source`, `rpcUrl`, `token0`, `token1`, `opts`, `pairsToQuote`, `extraSettings`
- `source` ожидается в формате:
  - `dex:arbitrum`
  - `dex:optimism`
  - `dex:base`
  - `dex:linea`
  - `dex:blast`

## Env

- `<NETWORK>_QUOTER_ADDRESS` (например `ARBITRUM_QUOTER_ADDRESS`) или fallback `QUOTER_ADDRESS`
- `REFERENCE_DIVISOR` (опционально, default `100`)
- для v2-роутеров:
  - `<NETWORK>_UNISWAP_V2_ROUTER`
  - `<NETWORK>_SUSHISWAP_V2_ROUTER`
  - `<NETWORK>_CAMELOT_V2_ROUTER`

