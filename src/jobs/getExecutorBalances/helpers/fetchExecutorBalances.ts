import { ethers } from 'ethers';
import { TokenBalanceInfo } from '../getExecutorBalances';

const ERC20_ABI = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
];

/**
 * Получает балансы токенов через owner-функции контракта ArbExecutor:
 *   - executor.ethBalance()
 *   - executor.trackedTokenBalances()
 *
 * @param executor — контракт ArbExecutor, подключённый через signer (owner)
 * @param provider — провайдер для чтения ERC20 metadata
 */
export async function fetchExecutorBalances(
  executor: ethers.Contract,
  provider: ethers.JsonRpcProvider,
): Promise<{ ethBal: bigint; tokens: TokenBalanceInfo[] }> {
  const [ethBalance, tokenBalancesResult] = await Promise.all([
    executor.ethBalance(),
    executor.trackedTokenBalances(),
  ]);

  const ethBal = ethBalance as bigint;
  const { tokens: tokenAddresses, balances } = tokenBalancesResult;

  const tokens: TokenBalanceInfo[] = await Promise.all(
    (tokenAddresses as string[]).map(async (addr: string, i: number) => {
      const rawBalance = (balances[i] as bigint).toString();
      const erc20 = new ethers.Contract(addr, ERC20_ABI, provider);
      try {
        const [symbol, name, decimals] = await Promise.all([
          erc20.symbol(),
          erc20.name().catch(() => ''),
          erc20.decimals(),
        ]);
        const dec = Number(decimals);
        return { address: addr, symbol, name, decimals: dec, rawBalance, formatted: ethers.formatUnits(rawBalance, dec) };
      } catch {
        return { address: addr, symbol: '???', name: '', decimals: 18, rawBalance, formatted: ethers.formatUnits(rawBalance, 18) };
      }
    }),
  );

  return { ethBal, tokens };
}

