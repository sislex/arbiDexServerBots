import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
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

  const forkNetwork = detectForkNetwork();
  if (forkNetwork === "arbitrum") return process.env.ARBITRUM_RPC;
  if (forkNetwork === "optimism") return process.env.OPTIMISM_RPC;
  if (forkNetwork === "base") return process.env.BASE_RPC;
  if (forkNetwork === "linea") return process.env.LINEA_RPC;
  if (forkNetwork === "blast") return process.env.BLAST_RPC;

  return (
    process.env.ARBITRUM_RPC ||
    process.env.OPTIMISM_RPC ||
    process.env.BASE_RPC ||
    process.env.LINEA_RPC ||
    process.env.BLAST_RPC
  );
}

function getHardhatHardfork(): string {
  if (process.env.HARDHAT_HARDFORK) {
    return process.env.HARDHAT_HARDFORK;
  }

  const forkNetwork = detectForkNetwork();
  if (forkNetwork === "arbitrum") {
    return "shanghai";
  }

  return "cancun";
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
const hardhatHardfork = getHardhatHardfork();
const hardhatChainId = getHardhatChainId();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: hardhatChainId,
      hardfork: hardhatHardfork,
      chains: {
        10: {
          hardforkHistory: {
            cancun: 0,
          },
        },
        42161: {
          hardforkHistory: {
            shanghai: 0,
          },
        },
        8453: {
          hardforkHistory: {
            cancun: 0,
          },
        },
        59144: {
          hardforkHistory: {
            cancun: 0,
          },
        },
        81457: {
          hardforkHistory: {
            cancun: 0,
          },
        },
      },
      forking: (process.env.HARDHAT_FORK && forkUrl)
        ? { url: forkUrl }
        : undefined,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
    },
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    optimism: {
      url: process.env.OPTIMISM_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10,
    },
    base: {
      url: process.env.BASE_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
    linea: {
      url: process.env.LINEA_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 59144,
    },
    blast: {
      url: process.env.BLAST_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 81457,
    },
  },
  etherscan: {
    apiKey: process.env.ARBISCAN_API_KEY || "",
  },
};

export default config;
