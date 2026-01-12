import {QuoteResultMulti} from '../handlers';
import {IArbitrage} from '../../store/state.types';

// export const arbitrageResponseStub: IArbitrage = {
//   "createdAt": "2025-12-29T19:35:19.687Z",
//   "blockNumber": 24120422,
//   "tokenIn": {
//     "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//     "decimals": 18
//   },
//   "tokenOut": {
//     "address": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
//     "decimals": 6
//   },
//   "amountIn": "30000000000000000",
//   "poolsCount": 5,
//   "spread_pct": 0.06,
//   "spread_bps": 6,
//   "amountOut": "88265253",
//   "amountInBuy": "88205200",
//   "profitOutToken": "60053",
//   "bestBuyPool": {
//     "dex": "sushi",
//     "version": "v2",
//     "token0": {
//       "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//       "decimals": 18
//     },
//     "token1": {
//       "address": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
//       "decimals": 6
//     },
//     "poolAddress": "0x905dfCD5649217c42684f23958568e533C711Aa3",
//     "feePpm": 3000,
//     "tokenIn": {
//       "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//       "decimals": 18
//     },
//     "tokenOut": {
//       "address": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
//       "decimals": 6
//     },
//     "side": "exactIn",
//     "amount": "30000000000000000",
//     "blockTag": "latest",
//     "quoteSource": "uniswap-v2-router",
//     "createdAt": "2025-12-26T21:39:44.562Z"
//   },
//   "bestSellPool": {
//     "dex": "uniswap",
//     "version": "v3",
//     "token0": {
//       "address": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
//       "decimals": 6
//     },
//     "token1": {
//       "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//       "decimals": 18
//     },
//     "poolAddress": "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443",
//     "feePpm": 500,
//     "tokenIn": {
//       "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//       "decimals": 18
//     },
//     "tokenOut": {
//       "address": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
//       "decimals": 6
//     },
//     "side": "exactIn",
//     "amount": "30000000000000000",
//     "blockTag": "latest",
//     "quoteSource": "uniswap-v3-quoter-v2",
//     "createdAt": "2025-12-26T21:39:44.563Z"
//   },
//   "bestSellQuote": {
//     "amountOut": "88265253",
//     "sqrtPriceX96After": "4298504813843300343428813",
//     "initializedTicksCrossed": "1",
//     "gasEstimate": "98411"
//   },
//   "bestBuyQuote": {
//     "amountIn": "88205200",
//     "sqrtPriceX96After": "0",
//     "initializedTicksCrossed": "0",
//     "gasEstimate": "0"
//   }
// }
