export interface IPool {
  pool?: string;
  pair?: string;
  token0: string;
  token1: string;
  fee?: number;
}

export interface IConfig {
  factoryAddress: string;
  version: 'v2' | 'v3' | 'v4';
  dexId: number;
  fee: number;
  start: number;
  finish: number | undefined;
  dexName: string;
  chainId: number;
}
export interface IV2ReserveResponse {
  address: string;
  token0: string;
  token1: string;
  reserve0: bigint | number | string;
  reserve1: bigint | number | string;
}

export interface IConfigDB {
  type: 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql';
  host: string;
  port: number;
  username: string;
  password?: string;
  database: string;
  schema?: string;
  ssl?: boolean | object;
}
