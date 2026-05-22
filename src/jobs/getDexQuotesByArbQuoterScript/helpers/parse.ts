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

export const normalizeSource = (source?: string): string => (source ?? '').trim().toLowerCase();

export const resolveEnvPrefixBySource = (
  source: string,
): 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'LINEA' | 'BLAST' | null => {
  if (source.startsWith('dex:arbitrum')) return 'ARBITRUM';
  if (source.startsWith('dex:optimism')) return 'OPTIMISM';
  if (source.startsWith('dex:base')) return 'BASE';
  if (source.startsWith('dex:linea')) return 'LINEA';
  if (source.startsWith('dex:blast')) return 'BLAST';
  return null;
};

export const resolveUnifiedDexSource = (source: string): 'dex:arbitrum' | 'dex:optimism' => {
  if (source.startsWith('dex:optimism')) return 'dex:optimism';
  return 'dex:arbitrum';
};

