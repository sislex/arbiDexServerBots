import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

type ForkNetwork = "arbitrum" | "optimism" | "base" | "linea" | "blast";

function detectForkNetwork(): ForkNetwork | undefined {
  const explicit = (process.env.FORK_NETWORK || "").toLowerCase();
  if (explicit === "arbitrum") return "arbitrum";
  if (explicit === "optimism") return "optimism";
  if (explicit === "base") return "base";
  if (explicit === "linea") return "linea";
  if (explicit === "blast") return "blast";

  const rpcUrl = (process.env.FORK_RPC_URL || "").toLowerCase();
  if (!rpcUrl) return undefined;
  if (rpcUrl.includes("arbitrum")) return "arbitrum";
  if (rpcUrl.includes("optimism")) return "optimism";
  if (rpcUrl.includes("mainnet.base.org") || rpcUrl.includes("base")) return "base";
  if (rpcUrl.includes("linea")) return "linea";
  if (rpcUrl.includes("blast")) return "blast";

  return undefined;
}

function getForkUrl(): string | undefined {
  if (process.env.FORK_RPC_URL) {
    return process.env.FORK_RPC_URL;
  }

  const explicitForkNetwork = (process.env.FORK_NETWORK || "").toLowerCase();
  const forkNetwork = detectForkNetwork();
  if (forkNetwork === "arbitrum") return process.env.ARBITRUM_RPC;
  if (forkNetwork === "optimism") return process.env.OPTIMISM_RPC || "https://mainnet.optimism.io";
  if (forkNetwork === "base") return process.env.BASE_RPC || "https://mainnet.base.org";
  if (forkNetwork === "linea") return process.env.LINEA_RPC;
  if (forkNetwork === "blast") return process.env.BLAST_RPC || "https://rpc.blast.io";

  // If FORK_NETWORK is explicitly selected but URL is missing, don't silently fall back to another chain.
  if (explicitForkNetwork) {
    return undefined;
  }

  return (
    process.env.ARBITRUM_RPC ||
    process.env.OPTIMISM_RPC ||
    process.env.BASE_RPC ||
    process.env.LINEA_RPC ||
    process.env.BLAST_RPC
  );
}

function getForkBlockNumber(): number | undefined {
  const forkNetwork = detectForkNetwork();
  const key = forkNetwork ? `${forkNetwork.toUpperCase()}_FORK_BLOCK_NUMBER` : undefined;
  const raw = process.env.FORK_BLOCK_NUMBER || (key ? process.env[key] : undefined);
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid fork block number: ${raw}`);
  }

  return Math.floor(parsed);
}

function getHardhatHardfork(): string {
  if (process.env.HARDHAT_HARDFORK) {
    return process.env.HARDHAT_HARDFORK;
  }

  const forkNetwork = detectForkNetwork();
  if (forkNetwork === "optimism" || forkNetwork === "base") {
    // Hardhat 3 uses OP hardfork names for OP-stack chains.
    return "isthmus";
  }
  if (forkNetwork === "arbitrum") {
    return "shanghai";
  }

  return "cancun";
}

function getHardhatChainType(): "op" | "generic" {
  const forkNetwork = detectForkNetwork();
  if (forkNetwork === "optimism" || forkNetwork === "base") {
    return "op";
  }

  return "generic";
}

function getHardhatChainId(): number {
  const explicitChainId = process.env.HARDHAT_CHAIN_ID;
  if (explicitChainId) {
    const parsed = Number(explicitChainId);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const forkNetwork = detectForkNetwork();
  if (forkNetwork === "arbitrum") return 42161;
  if (forkNetwork === "optimism") return 10;
  if (forkNetwork === "base") return 8453;
  if (forkNetwork === "linea") return 59144;
  if (forkNetwork === "blast") return 81457;

  // Keep Hardhat's default dev chain id when no fork network was detected.
  return 31337;
}

const forkUrl = getForkUrl();
const forkBlockNumber = getForkBlockNumber();
const hardhatHardfork = getHardhatHardfork();
const hardhatChainId = getHardhatChainId();
const hardhatChainType = getHardhatChainType();

const config = defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  chainDescriptors: {
    10: {
      name: "OP Mainnet",
      chainType: "op",
      hardforkHistory: {
        isthmus: { blockNumber: 0 },
      },
    },
    8453: {
      name: "Base",
      chainType: "op",
      hardforkHistory: {
        isthmus: { blockNumber: 0 },
      },
    },
    42161: {
      name: "Arbitrum One",
      chainType: "generic",
      hardforkHistory: {
        shanghai: { blockNumber: 0 },
      },
    },
    59144: {
      name: "Linea",
      chainType: "generic",
      hardforkHistory: {
        cancun: { blockNumber: 0 },
      },
    },
    81457: {
      name: "Blast",
      chainType: "generic",
      hardforkHistory: {
        cancun: { blockNumber: 0 },
      },
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: hardhatChainType,
      chainId: hardhatChainId,
      hardfork: hardhatHardfork,
      forking: (process.env.HARDHAT_FORK && forkUrl)
        ? {
          url: forkUrl,
          ...(forkBlockNumber !== undefined ? { blockNumber: forkBlockNumber } : {}),
        }
        : undefined,
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    arbitrum: {
      type: "http",
      url: process.env.ARBITRUM_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
    },
    arbitrumSepolia: {
      type: "http",
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    optimism: {
      type: "http",
      url: process.env.OPTIMISM_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10,
    },
    base: {
      type: "http",
      url: process.env.BASE_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
    linea: {
      type: "http",
      url: process.env.LINEA_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 59144,
    },
    blast: {
      type: "http",
      url: process.env.BLAST_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 81457,
    },
  },
  etherscan: {
    apiKey: process.env.ARBISCAN_API_KEY || "",
  },
});

export default config;
