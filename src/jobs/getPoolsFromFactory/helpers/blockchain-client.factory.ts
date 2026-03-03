import { createPublicClient, http, Chain } from 'viem';
import { mainnet, arbitrum, polygon } from 'viem/chains';
import { ChainDto } from './dtos/chains-dto/chain.dto';

const CHAINS: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [arbitrum.id]: arbitrum,
  [polygon.id]: polygon,
};

export const getBlockchainClient = (dto: ChainDto, rpcUrl: string) => {
  const chain = CHAINS[dto.chainId];

  if (!chain) {
    throw new Error(`Сеть для ID ${dto.chainId} не настроены`);
  }

  return createPublicClient({
    chain: chain,
    transport: http(rpcUrl, { batch: true }),
  });
};
