// ── общий setup (синглтон) ───────────────────────────────────
import {ethers} from 'ethers';
import SwapStepsConfigReaderAbi from '../../../artifacts/contracts/SwapStepsConfigReader.sol/SwapStepsConfigReader.json';

const READER = "0x468fc19a6D226963275D94ee6Dbb70Be1920675F";

const cache = new Map<string, { provider: ethers.JsonRpcProvider; reader: ethers.Contract }>();

export function setup(rpcUrl: string) {
  const cached = cache.get(rpcUrl);
  if (cached) return cached;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const reader   = new ethers.Contract(READER, SwapStepsConfigReaderAbi.abi, provider);

  const entry = { provider, reader };
  cache.set(rpcUrl, entry);
  return entry;
}
