# Logs

## 2026-05-20

- Feature created: `getDexQuotesByArbQuoterScript`.
- Added new job type: `get_Dex_Quotes_By_Arb_Quoter_Script`.
- Added handler wiring in `src/jobs/handlers.ts`.
- Added script-style quote execution path:
  - network-based env prefix resolution
  - `buildStoreStep` for v2/v3 pools
  - `quoteExactInWithImpact` static calls per pool
- Preserved saving strategy from current job:
  - `dexToUnified(...)`
  - `marketDataClient.writeQuote(...)`

## 2026-05-21

- Fixed startup issue `pairsToQuote пуст` for script job.
- Added fallback config resolver by `source`:
  - `dex:arbitrum|dex:optimism|dex:base|dex:linea|dex:blast`
- If `pairsToQuote` is empty in runtime params, job now loads pools from
  `src/scripts/arbQuoter/networks/*/*PoolsConfigList.stabs.ts`.
- Added token address fallback from first pool (`pairsToQuote[0].token0/token1`).
- Improved source matching to prefix mode (`source.startsWith(...)`) so
  extended values like `dex:arbitrum:*` still resolve network config.
- Added robust address resolver that ignores empty strings (`""`) and picks
  first non-empty value across params/config/pool fallbacks.
- Added early diagnostic error in job when token addresses still unresolved.
- Switched quote execution to `*Ether` script logic:
  - one batch call `quoteConfigExactInWithImpact(quoteInput)`
  - mapped `buyAmountOutHumanX18/sellAmountOutHumanX18` into job quotes
  - passed through `gasUsed` from batch response
- Added runtime fallback: if batch `quoteConfigExactInWithImpact` reverts
  (e.g. one broken pool), job auto-falls back to per-pool
  `quoteExactInWithImpact` with isolated try/catch per pool.
- Fixed extraSettings merge behavior:
  - network config settings are now base values
  - runtime extraSettings override only when present/valid
  - prevents accidental `amountIn=0` when runtime sends empty string/object.
- Added strict numeric resolver for runtime settings:
  - `amountIn/amountOut/referenceDivisor` now accept only finite positive numbers
  - non-positive or invalid runtime values no longer overwrite network defaults.
- Added explicit early error when resolved `amountIn <= 0`.

## 2026-06-06

- Синхронизирован README с текущей реализацией в
  `src/jobs/getDexQuotesByArbQuoterScript`.
- Зафиксировано, что текущий helper job требует непустой `pairsToQuote` и не
  подгружает network stabs-конфиги автоматически.
- Зафиксировано, что `extraSettings.amountIn` в helper должен быть одиночным
  положительным числом; массивы там сейчас не поддерживаются.
- Исправлено описание unified-маппинга с `dexToUnified(...)` на
  `arbSummaryToUnified(...)`.
- Исправлено описание env: текущий quoter resolver читает
  `<NETWORK>_QUOTER_ADDRESS` напрямую и не читает generic `QUOTER_ADDRESS`.
- Добавлено актуальное покрытие v2 router env, включая pancakeswap router keys.
