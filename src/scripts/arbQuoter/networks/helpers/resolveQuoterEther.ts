import { readFile } from "node:fs/promises";
import path from "node:path";
import { Contract, JsonRpcProvider, ethers, type InterfaceAbi } from "ethers";

type ResolveQuoterEtherOptions = {
  quoterEnvKey: string;
  rpcUrl?: string;
  networkEnvPrefix?: string;
};

type ArbQuoterArtifact = {
  abi: InterfaceAbi;
};

async function loadArbQuoterAbi() {
  const artifactPath = path.resolve(process.cwd(), "src/artifacts/contracts/ArbQuoter.sol/ArbQuoter.json");

  const raw = await readFile(artifactPath, "utf8");
  const artifact = JSON.parse(raw) as ArbQuoterArtifact;
  if (!Array.isArray(artifact.abi) || artifact.abi.length === 0) {
    throw new Error(`Invalid ABI in artifact: ${artifactPath}`);
  }
  return artifact.abi;
}

function resolveRpcUrl(options: ResolveQuoterEtherOptions) {
  const { rpcUrl, networkEnvPrefix } = options;
  if (rpcUrl) return rpcUrl;

  if (networkEnvPrefix) {
    const prefixed = process.env[`${networkEnvPrefix.toUpperCase()}_RPC`];
    if (prefixed) return prefixed;
  }

  if (process.env.RPC_URL) return process.env.RPC_URL;

  throw new Error(
    `Missing RPC url. Set ${networkEnvPrefix ? `${networkEnvPrefix.toUpperCase()}_RPC, ` : ""}RPC_URL or pass rpcUrl option.`,
  );
}

export async function resolveQuoterEther(options: ResolveQuoterEtherOptions) {
  const rpcUrl = resolveRpcUrl(options);
  const quoterAddress = process.env[options.quoterEnvKey] || process.env.QUOTER_ADDRESS;
  if (!quoterAddress) {
    throw new Error(`Missing ${options.quoterEnvKey} or QUOTER_ADDRESS in .env`);
  }

  const normalizedAddress = ethers.getAddress(quoterAddress);
  const provider = new JsonRpcProvider(rpcUrl);
  const [abi, code, providerNetwork] = await Promise.all([
    loadArbQuoterAbi(),
    provider.getCode(normalizedAddress),
    provider.getNetwork(),
  ]);

  if (code === "0x") {
    throw new Error(`No contract code at quoter ${normalizedAddress} on chainId=${providerNetwork.chainId}.`);
  }

  return {
    provider,
    providerNetwork,
    quoterAddress: normalizedAddress,
    quoter: new Contract(normalizedAddress, abi, provider),
  };
}


