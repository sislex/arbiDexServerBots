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

