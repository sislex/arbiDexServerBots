import { IJobParams_get_Dex_Quotes_By_Arb_Quoter, IJobType } from '../../../../store/state.types';
import { DeployedImpactQuoteStabsConfig } from './types';
import { ArbitrumPoolsConfigListStabs } from '../arbitrum/arbitrumPoolsConfigList.stabs';
import { OptimismPoolsConfigListStabs } from '../optimism/optimismPoolsConfigList.stabs';
import { BasePoolsConfigListStabs } from '../base/basePoolsConfigList.stabs';
import { LineaPoolsConfigListStabs } from '../linea/lineaPoolsConfigList.stabs';
import { BlastPoolsConfigListStabs } from '../blast/blastPoolsConfigList.stabs';

type ConfigKey = 'arbitrum' | 'optimism' | 'base' | 'linea' | 'blast';

const CONFIGS: Record<ConfigKey, DeployedImpactQuoteStabsConfig> = {
  arbitrum: ArbitrumPoolsConfigListStabs,
  optimism: OptimismPoolsConfigListStabs,
  base: BasePoolsConfigListStabs,
  linea: LineaPoolsConfigListStabs,
  blast: BlastPoolsConfigListStabs,
};

const getArgValue = (name: string): string | undefined => {
  const prefixed = `${name}=`;
  const exact = process.argv.find((arg) => arg.startsWith(prefixed));
  if (exact) return exact.slice(prefixed.length);

  const idx = process.argv.findIndex((arg) => arg === name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];

  return undefined;
};

export const parseExtraSettings = (extraSettings: unknown): Record<string, unknown> => {
  if (!extraSettings) return {};
  if (typeof extraSettings === 'string') {
    try {
      return JSON.parse(extraSettings) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof extraSettings === 'object') {
    return extraSettings as Record<string, unknown>;
  }
  return {};
};

export const resolveConfigFromArgs = (): { config: DeployedImpactQuoteStabsConfig; key: string } => {
  const configArg = getArgValue('--config')?.trim().toLowerCase();
  if (configArg) {
    if (configArg in CONFIGS) {
      const key = configArg as ConfigKey;
      return { config: CONFIGS[key], key };
    }

    throw new Error(`Unknown --config=${configArg}. Allowed: ${Object.keys(CONFIGS).join(', ')}`);
  }

  const sourceArg = getArgValue('--source')?.trim().toLowerCase();
  if (sourceArg) {
    const entry = Object.entries(CONFIGS).find(([, cfg]) => cfg.source.trim().toLowerCase() === sourceArg);
    if (!entry) {
      throw new Error(`Unknown --source=${sourceArg}. Expected one of: ${Object.values(CONFIGS).map((x) => x.source).join(', ')}`);
    }
    const [key, config] = entry as [ConfigKey, DeployedImpactQuoteStabsConfig];
    return { config, key };
  }

  return { config: CONFIGS.arbitrum, key: 'arbitrum' };
};

export const resolveQuoterEnvKeyBySource = (source: string): string => {
  const normalized = source.trim().toLowerCase();
  if (normalized.startsWith('dex:arbitrum')) return 'ARBITRUM_QUOTER_ADDRESS';
  if (normalized.startsWith('dex:optimism')) return 'OPTIMISM_QUOTER_ADDRESS';
  if (normalized.startsWith('dex:base')) return 'BASE_QUOTER_ADDRESS';
  if (normalized.startsWith('dex:linea')) return 'LINEA_QUOTER_ADDRESS';
  if (normalized.startsWith('dex:blast')) return 'BLAST_QUOTER_ADDRESS';
  return 'QUOTER_ADDRESS';
};

export const toJobParams = (config: DeployedImpactQuoteStabsConfig): IJobParams_get_Dex_Quotes_By_Arb_Quoter => {
  const tokenInAddress = config.token0 ?? config.opts?.tokenIn?.address ?? '';
  const tokenOutAddress = config.token1 ?? config.opts?.tokenOut?.address ?? '';

  const opts = {
    tokenIn: {
      address: tokenInAddress,
      decimals: config.opts?.tokenIn?.decimals ?? 18,
      symbol: config.opts?.tokenIn?.symbol ?? 'tokenIn',
    },
    tokenOut: {
      address: tokenOutAddress,
      decimals: config.opts?.tokenOut?.decimals ?? 18,
      symbol: config.opts?.tokenOut?.symbol ?? 'tokenOut',
    },
  };

  return {
    jobType: IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
    source: config.source,
    rpcUrl: config.rpcUrl,
    token0: tokenInAddress,
    token1: tokenOutAddress,
    opts,
    pairsToQuote: config.pairsToQuote as IJobParams_get_Dex_Quotes_By_Arb_Quoter['pairsToQuote'],
    extraSettings: config.extraSettings,
  };
};

export const formatNumberFixed = (value: number, precision = 6): string => {
  if (!Number.isFinite(value)) return 'n/a';
  if (value === 0) return '0';
  if (Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toFixed(precision);
};

