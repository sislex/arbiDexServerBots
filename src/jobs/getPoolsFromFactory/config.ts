// import { getUniswapV3PoolsFromFactory } from '../-helpers/getUniswapV3PoolsFromFactory';
// import { getCamelotV3PoolsFromFactory } from '../-helpers/getCamelotV3PoolsFromFactory';

import { IConfig } from './getPoolsFromFactory';

// const pools = await getUniswapV3PoolsFromFactory(UNISWAP_V3_FACTORY, 1, );
// const pools = await getV2PoolsFromFactory(UNISWAP_V2_FACTORY, 1,  );

// const pools = await getUniswapV3PoolsFromFactory(SUSHISWAP_V3_FACTORY, 1,  );
// const pools = await getV2PoolsFromFactory(SUSHISWAP_V2_FACTORY, 1,  );

// const pools = await getCamelotV3PoolsFromFactory(CAMELOT_V3_FACTORY, 1,  );
// const n = 1;
// const pools = await getV2PoolsFromFactory(CAMELOT_V2_FACTORY, n,  n+50000000);

// export const ARBISCAN_RPC = 'https://arb-mainnet.g.alchemy.com/v2/TxHI6ptndQEJi3coISt0BcQZdZg1rnWV';
// export const ARBISCAN_RPC2 = 'https://arb1.arbitrum.io/rpc';
// const INFURA_KEY = '6113828fd8e8448f9a9e3fa7962e2cc6';
//
// const ERC20_ABI = [
//   'function name() view returns (string)',
//   'function symbol() view returns (string)',
//   'function decimals() view returns (uint8)',
// ];

export const configCreateUniswapV2: IConfig = {
  factoryAddress: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
  version: 'v2',
  dexId: 1,
  fee: 3000,
};

export const configCreateUniswapV3: IConfig = {
  factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  version: 'v3',
  dexId: 1,
  fee: 0,
};

export const configCreateSushiV2: IConfig = {
  factoryAddress: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
  version: 'v2',
  dexId: 2,
  fee: 3000,
};

export const configCreateSushiV3: IConfig = {
  factoryAddress: '0x1Af415A1EbA07A4986A52B6F2E7DE7003d82231E',
  version: 'v3',
  dexId: 2,
  fee: 0,
};

export const configCreateCamelotV2: IConfig = {
  factoryAddress: '0x6EcCab422D763AC031210895C81787E87B43A652',
  version: 'v2',
  dexId: 3,
  fee: 3000,
};

export const configCreateCamelotV3: IConfig = {
  factoryAddress: '0x1a3C9B1d2F0529D97f2AfC5136Cc23E58f1FD35B',
  version: 'v3',
  dexId: 3,
  fee: 0,
};
