import { createPublicClient, http } from 'viem';
import { mainnet, arbitrum, polygon } from 'viem/chains';

const RPC_URLS: Record<number, string> = {
  [mainnet.id]: 'https://eth-mainnet.g.alchemy.com',
  [arbitrum.id]: 'https://arb-mainnet.g.alchemy.com',
  [polygon.id]: 'https://polygon-mainnet.g.alchemy.com',
};

export const getBlockchainClient = (chainId: number) => {
  const chain = mainnet;

  const rpcUrl = RPC_URLS[chain.id];

  if (!rpcUrl) {
    throw new Error(`RPC URL для сети ${chain.name} не настроен`);
  }

  return createPublicClient({
    chain,
    transport: http(rpcUrl, { batch: true }),
  });
};
