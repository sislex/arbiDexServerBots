import { ArbitrumPoolsConfigListStabs } from '../../../scripts/arbQuoter/networks/arbitrum/arbitrumPoolsConfigList.stabs';
import { OptimismPoolsConfigListStabs } from '../../../scripts/arbQuoter/networks/optimism/optimismPoolsConfigList.stabs';
import { BasePoolsConfigListStabs } from '../../../scripts/arbQuoter/networks/base/basePoolsConfigList.stabs';
import { LineaPoolsConfigListStabs } from '../../../scripts/arbQuoter/networks/linea/lineaPoolsConfigList.stabs';
import { BlastPoolsConfigListStabs } from '../../../scripts/arbQuoter/networks/blast/blastPoolsConfigList.stabs';

type ScriptNetworkConfig = {
  source: string;
  rpcUrl?: string;
  token0?: string;
  token1?: string;
  opts?: {
    tokenIn?: { address?: string; decimals?: number; symbol?: string };
    tokenOut?: { address?: string; decimals?: number; symbol?: string };
  };
  extraSettings?: unknown;
  pairsToQuote?: Array<{
    dex: string;
    version: string;
    poolAddress: string;
    feePpm?: number;
    token0?: string;
    token1?: string;
  }>;
};

const CONFIGS: Record<string, ScriptNetworkConfig> = {
  'dex:arbitrum': ArbitrumPoolsConfigListStabs,
  'dex:optimism': OptimismPoolsConfigListStabs,
  'dex:base': BasePoolsConfigListStabs,
  'dex:linea': LineaPoolsConfigListStabs,
  'dex:blast': BlastPoolsConfigListStabs,
};

export function getScriptNetworkConfig(source: string): ScriptNetworkConfig | null {
  const normalized = (source ?? '').trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.startsWith('dex:arbitrum')) return CONFIGS['dex:arbitrum'];
  if (normalized.startsWith('dex:optimism')) return CONFIGS['dex:optimism'];
  if (normalized.startsWith('dex:base')) return CONFIGS['dex:base'];
  if (normalized.startsWith('dex:linea')) return CONFIGS['dex:linea'];
  if (normalized.startsWith('dex:blast')) return CONFIGS['dex:blast'];

  return CONFIGS[normalized] ?? null;
}

