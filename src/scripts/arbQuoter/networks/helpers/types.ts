export type NetworkEnvPrefix = 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST';

export type PoolQuoteConfig = {
  dex: string;
  version: string;
  poolAddress: string;
  feePpm?: number;
};

export type DeployedImpactQuoteStabsConfig = {
  source: string;
  rpcUrl: string;
  token0?: string;
  token1?: string;
  opts?: {
    tokenIn?: { address?: string; decimals?: number; symbol?: string };
    tokenOut?: { address?: string; decimals?: number; symbol?: string };
  };
  extraSettings?: {
    amountIn?: number;
    amountOut?: number;
  };
  pairsToQuote: PoolQuoteConfig[];
};

export type RunDeployedImpactQuoteTestOptions = {
  networkName: string;
  envPrefix: NetworkEnvPrefix;
  configName: string;
  config: DeployedImpactQuoteStabsConfig;
  includeRevertHint?: boolean;
};


