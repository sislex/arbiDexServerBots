# ArbQuoter test scripts

Структура и нейминг синхронизированы с `arbiDexSmartcontracts/scripts/arbQuoter`.

## Структура

- `compareCamelotV2.ts`
- `deploy.ts`
- `testDeployedOptimism.ts`
- `networks/arbitrum/arbitrumPoolsConfigList.stabs.ts`
- `networks/arbitrum/testDeployedArbitrum.ts`
- `networks/optimism/optimismPoolsConfigList.stabs.ts`
- `networks/optimism/testDeployedOptimism.ts`
- `networks/base/basePoolsConfigList.stabs.ts`
- `networks/base/testDeployedBase.ts`
- `networks/base/testDeployedBaseParallel.ts`
- `networks/linea/lineaPoolsConfigList.stabs.ts`
- `networks/linea/testDeployedLinea.ts`
- `networks/blast/blastPoolsConfigList.stabs.ts`
- `networks/blast/testDeployedBlast.ts`
- `networks/helpers/runDeployedImpactQuoteTest.ts`

## Что нужно в `.env`

Минимально:

- `ARBITRUM_RPC`, `ARBITRUM_QUOTER_ADDRESS`
- `OPTIMISM_RPC`, `OPTIMISM_QUOTER_ADDRESS`
- `BASE_RPC`, `BASE_QUOTER_ADDRESS`
- `LINEA_RPC`, `LINEA_QUOTER_ADDRESS`
- `BLAST_RPC`, `BLAST_QUOTER_ADDRESS`

Для v2-пулов можно переопределить роутеры:

- `OPTIMISM_UNISWAP_V2_ROUTER`, `OPTIMISM_SUSHISWAP_V2_ROUTER`
- `BASE_UNISWAP_V2_ROUTER`, `BASE_SUSHISWAP_V2_ROUTER`
- `LINEA_UNISWAP_V2_ROUTER`, `LINEA_SUSHISWAP_V2_ROUTER`
- `BLAST_UNISWAP_V2_ROUTER`, `BLAST_SUSHISWAP_V2_ROUTER`

Опционально:

- `AMOUNT_IN=0.01` или `AMOUNTS_IN=0.01,0.05,0.1`
- `REFERENCE_DIVISOR=100`

## Примеры запуска

```bash
npm run arbq:test:arbitrum
npm run arbq:test:optimism
npm run arbq:test:base
npm run arbq:test:linea
npm run arbq:test:blast
```


