import { getNetworkEnvPrefix } from './getNetworkEnvPrefix';

describe('getNetworkEnvPrefix', () => {
  it('maps dex source to env prefix', () => {
    expect(getNetworkEnvPrefix('dex:arbitrum')).toBe('ARBITRUM');
    expect(getNetworkEnvPrefix('dex:optimism')).toBe('OPTIMISM');
    expect(getNetworkEnvPrefix('dex:base')).toBe('BASE');
    expect(getNetworkEnvPrefix('dex:linea')).toBe('LINEA');
    expect(getNetworkEnvPrefix('dex:blast')).toBe('BLAST');
  });

  it('supports source without prefix and mixed case', () => {
    expect(getNetworkEnvPrefix('ArBiTrUm')).toBe('ARBITRUM');
    expect(getNetworkEnvPrefix('  dex:Base  ')).toBe('BASE');
  });

  it('throws for unsupported source', () => {
    expect(() => getNetworkEnvPrefix('dex:polygon')).toThrow('Unsupported source');
  });
});

