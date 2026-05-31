export type NetworkEnvPrefix = 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST';

const SOURCE_TO_ENV_PREFIX: Record<string, NetworkEnvPrefix> = {
  arbitrum: 'ARBITRUM',
  optimism: 'OPTIMISM',
  base: 'BASE',
  linea: 'LINEA',
  blast: 'BLAST',
};

export function getNetworkEnvPrefix(source: string): NetworkEnvPrefix {
  if (!source) {
    throw new Error('Missing source. Expected format: dex:<network>, e.g. dex:arbitrum');
  }

  const normalized = source.trim().toLowerCase();
  const [, network = normalized] = normalized.split(':', 2);
  const prefix = SOURCE_TO_ENV_PREFIX[network];

  if (!prefix) {
    throw new Error(
      `Unsupported source "${source}". Supported: dex:arbitrum, dex:optimism, dex:base, dex:linea, dex:blast`,
    );
  }

  return prefix;
}

