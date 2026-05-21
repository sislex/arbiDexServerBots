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

