import { IConfig } from './models';

export const configCreateUniswapV2: IConfig = {
  factoryAddress: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
  version: 'v2',
  dexId: 1,
  fee: 3000,
  start: 1,
  finish: undefined,
  dexName: 'uniswap',
  chainId: 42161,
};

export const configCreateUniswapV3: IConfig = {
  factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  version: 'v3',
  dexId: 1,
  fee: 0,
  start: 1,
  finish: undefined,
  dexName: 'uniswap',
  chainId: 42161,
};

export const configCreateSushiV2: IConfig = {
  factoryAddress: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
  version: 'v2',
  dexId: 2,
  fee: 3000,
  start: 1,
  finish: undefined,
  dexName: 'sushiswap',
  chainId: 42161,
};

export const configCreateSushiV3: IConfig = {
  factoryAddress: '0x1Af415A1EbA07A4986A52B6F2E7DE7003d82231E',
  version: 'v3',
  dexId: 2,
  fee: 0,
  start: 1,
  finish: undefined,
  dexName: 'sushiswap',
  chainId: 42161,
};

export const configCreateCamelotV2: IConfig = {
  factoryAddress: '0x6EcCab422D763AC031210895C81787E87B43A652',
  version: 'v2',
  dexId: 3,
  fee: 3000,
  start: 1,
  finish: 40000002,
  dexName: 'camelot',
  chainId: 42161,
};

export const configCreateCamelotV3: IConfig = {
  factoryAddress: '0x1a3C9B1d2F0529D97f2AfC5136Cc23E58f1FD35B',
  version: 'v3',
  dexId: 3,
  fee: 0,
  start: 1,
  finish: undefined,
  dexName: 'camelot',
  chainId: 42161,
};
