# getDexQuotesByArbQuoterScript

## Что это

DEX job для получения best buy / best sell по пулам через ethers-ветку ArbQuoter:
батч-вызов `quoteConfigExactInWithImpact.staticCall(...)` и fallback на
single-pool вызовы, если весь batch reverted.

## Отличия от текущей job

- Текущая job: использует существующий поток `fetchBuySellQuotes`.
- Эта job: формирует `ConfigQuoteInput` через
  `helpers/configQuoteInput.ts` и вызывает `quoteConfigExactInWithImpact` через
  `helpers/runDeployedImpactQuoteTestEther.ts`.
- В ответе контракта использует:
  - `buyAmountOutHumanX18` как buy amountOut
  - `sellAmountOutHumanX18` как sell amountOut
- На выходе строит arb summary:
  - `bestBuyRows`
  - `bestSellRows`
  - `arbLines`

## Совместимость сохранения

Сохранение осталось таким же:

1. arb summary маппится в unified через `arbSummaryToUnified`
2. запись в market-data через `marketDataClient.writeQuote(...)`

`writeQuote(...)` пишет только успешные unified quotes. Для DEX дополнительно
пишутся best pool значения, если они есть в `bestBuyPool` / `bestSellPool`.

## Использование

- `jobType`: `get_Dex_Quotes_By_Arb_Quoter_Script`
- Входные поля совместимы с `get_Dex_Quotes_By_Arb_Quoter`:
  - `source`, `rpcUrl`, `token0`, `token1`, `opts`, `pairsToQuote`,
    `extraSettings`
- `pairsToQuote` обязателен. Если массив пустой, job завершится ошибкой
  `<NETWORK>.pairsToQuote is empty`.
- Network stabs-конфиги лежат в:
  - `src/scripts/arbQuoter/networks/{network}/*PoolsConfigList.stabs.ts`
  Их можно использовать как готовые params, но job сама их не подставляет.
- `source` ожидается в формате:
  - `dex:arbitrum`
  - `dex:optimism`
  - `dex:base`
  - `dex:linea`
  - `dex:blast`
- Расширенные значения вида `dex:arbitrum:*` тоже резолвятся как `ARBITRUM`.

## Params

- `rpcUrl`: RPC endpoint. Если не передан в config, resolver может взять
  `<NETWORK>_RPC` или `RPC_URL`, но тип job ожидает `rpcUrl`.
- `opts.tokenIn.address` / `opts.tokenOut.address`: основные token addresses.
- `token0` / `token1`: deprecated fallback для token addresses.
- `opts.tokenIn.decimals` / `opts.tokenOut.decimals`: decimals токенов,
  default `18`.
- `extraSettings.amountIn`: обязательное положительное одиночное число.
  Массив сейчас не поддерживается в job helper и приведёт к ошибке.
- `extraSettings.amountOut`: опциональное положительное число. Если отсутствует
  или `<= 0`, sell-side quote выключается.
- `extraSettings.referenceDivisor`: опциональное положительное число, default
  `100`.
- `pairsToQuote[].version`: поддерживаются `v2`, `v3`, `v4`.
- `pairsToQuote[].dex`: для v2 router resolution поддерживаются:
  - базовые: `uniswap`, `sushi`, `camelot`, `pancake`
  - optimism: `velodrome`
  - base: `aerodrome`, `quickswap`
  - blast: `blaster`, `thruster`, `monoswap`
  - linea: `syncswap`, `echodex`
  - fallback: `nile`, `nuri`
  Сеть берётся из `source` (`dex:optimism` → `OPTIMISM`), а не из hardhat env.
  Dex вроде `roguex`, `horizondex`, `iziswap`, `metavault` обычно `v3` —
  для них V2 router не нужен.

## Env

- `<NETWORK>_QUOTER_ADDRESS` (например `ARBITRUM_QUOTER_ADDRESS`)
- `<NETWORK>_RPC` или `RPC_URL` используются только если `rpcUrl` не передан
- для v2-роутеров:
  - `<NETWORK>_UNISWAP_V2_ROUTER`
  - `<NETWORK>_SUSHISWAP_V2_ROUTER`
  - `<NETWORK>_CAMELOT_V2_ROUTER`
  - `<NETWORK>_PANCAKESWAP_V2_ROUTER`
  - `<NETWORK>_VELODROME_V2_ROUTER`
  - `<NETWORK>_AERODROME_V2_ROUTER`
  - `<NETWORK>_BLASTER_V2_ROUTER`
  - `<NETWORK>_THRUSTER_V2_ROUTER`
  - `<NETWORK>_MONOSWAP_V2_ROUTER`
  - `<NETWORK>_SYNCSWAP_V2_ROUTER`
  - `<NETWORK>_ECHODEX_V2_ROUTER`
  - `<NETWORK>_QUICKSWAP_V2_ROUTER`
- generic fallback для v2-роутеров: те же ключи без `<NETWORK>_` префикса
  (`UNISWAP_V2_ROUTER`, `VELODROME_V2_ROUTER`, …)

## Ошибки и fallback

- Если batch `quoteConfigExactInWithImpact` reverted, helper переключается в
  fallback single-pool mode.
- В fallback режиме каждый pool вызывается отдельно, успешные pool quotes
  остаются в результате, ошибки по нескольким pool добавляются в `arbLines`.
- Если все pools failed, job возвращает `ok: false`, пишет failed unified quote
  в ответе, но `marketDataClient.writeQuote(...)` его не отправляет.
