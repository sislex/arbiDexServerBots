# getDexQuotesByArbQuoterScript

## Что это

Новая DEX job, которая повторяет контракт и сохранение текущей `getDexQuotesByArbQuoter`, но исполняет получение котировок по новой `*Ether`-логике (батч-вызов `quoteConfigExactInWithImpact`).

## Отличия от текущей job

- Текущая job: использует существующий поток `fetchBuySellQuotes`.
- Эта job: формирует `ConfigQuoteInput` и вызывает `quoteConfigExactInWithImpact` как в
  `src/scripts/arbQuoter/networks/helpers/runDeployedImpactQuoteTestEther.ts`.
- В ответе контракта использует:
  - `buyAmountOutHumanX18` как buy amountOut
  - `sellAmountOutHumanX18` как sell amountOut
  - `gasUsed` из batch-ответа

## Совместимость сохранения

Сохранение осталось таким же:

1. результат маппится в unified через `dexToUnified`
2. запись в market-data через `marketDataClient.writeQuote(...)`

## Использование

- `jobType`: `get_Dex_Quotes_By_Arb_Quoter_Script`
- Входные поля совместимы с `get_Dex_Quotes_By_Arb_Quoter`:
  - `source`, `rpcUrl`, `token0`, `token1`, `opts`, `pairsToQuote`, `extraSettings`
- Если `pairsToQuote` не передан или пустой, job автоматически подставляет network-конфиг из:
  - `src/scripts/arbQuoter/networks/{network}/*PoolsConfigList.stabs.ts`
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

