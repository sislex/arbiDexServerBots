// scripts/arbQuoter/deploy.ts
//
// Deploy ArbQuoter + optionally configure V4 quoter.
//
// Usage:
//   npx hardhat run scripts/arbQuoter/deploy.ts --network arbitrum

import { ethers, network } from "hardhat";

function addr(x?: string, label?: string) {
  if (!x) throw new Error(`Missing address for ${label ?? "unknown"}`);
  return ethers.getAddress(x.trim().toLowerCase());
}

function pickEnv(baseKey: string, prefix?: string): string | undefined {
  if (!prefix) return process.env[baseKey];
  const prefixedKey = `${prefix}_${baseKey}`;
  return process.env[prefixedKey] ?? process.env[baseKey];
}

async function main() {
  const networkToPrefix: Record<string, string> = {
    arbitrum: "ARBITRUM",
    optimism: "OPTIMISM",
    base: "BASE",
    blast: "BLAST",
    linea: "LINEA",
  };

  const net = network.name;
  const prefix = networkToPrefix[net];

  const [owner] = await ethers.getSigners();
  const provider = owner.provider!;

  async function getGasPriceFallback(): Promise<bigint> {
    const rpcGasPrice = await provider.send("eth_gasPrice", []);
    return BigInt(rpcGasPrice);
  }

  const v4QuoterAddressRaw = pickEnv("V4_QUOTER_ADDRESS", prefix);
  const v4QuoterAddress = v4QuoterAddressRaw ? addr(
    v4QuoterAddressRaw,
    prefix ? `${prefix}_V4_QUOTER_ADDRESS | V4_QUOTER_ADDRESS` : "V4_QUOTER_ADDRESS"
  ) : undefined;

  console.log("Network:", net);
  console.log("Env prefix:", prefix ?? "(none, using generic env keys)");
  console.log("Owner:", owner.address);
  console.log("Balance:", ethers.formatEther(await provider.getBalance(owner.address)), "ETH");
  console.log("V4 Quoter:", v4QuoterAddress ?? "(not set, will skip)");

  const Factory = await ethers.getContractFactory("ArbQuoter", owner);

  // constructor(address initialOwner)
  const initialOwner = owner.address;

  // 1️⃣ Оценка газа
  const deployTx = await Factory.getDeployTransaction(initialOwner);
  const gasEstimate = await provider.estimateGas({ ...deployTx, from: owner.address });
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas ?? await getGasPriceFallback();
  const costWei = gasEstimate * gasPrice;

  console.log("\n=== DEPLOY ESTIMATE ===");
  console.log("Gas estimate:", gasEstimate.toString());
  console.log("Gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
  console.log("Cost:", ethers.formatEther(costWei), "ETH");

  // 🚀 Деплой
  console.log("\nDeploying ArbQuoter...\n");

  const contract = await Factory.deploy(initialOwner);
  const deployReceipt = await contract.deploymentTransaction()?.wait();

  const address = await contract.getAddress();
  console.log("Deployed at:", address);

  const contractOwner = await contract.owner();
  console.log("Owner:", contractOwner);

  if (contractOwner.toLowerCase() !== initialOwner.toLowerCase()) {
    throw new Error(`Owner mismatch! Expected ${initialOwner}, got ${contractOwner}`);
  }

  if (deployReceipt) {
    const gasUsed = deployReceipt.gasUsed;
    const effectiveGasPrice = deployReceipt.gasPrice ?? gasPrice;
    const realCost = gasUsed * effectiveGasPrice;

    console.log("\n=== REAL DEPLOY COST ===");
    console.log("Gas used:", gasUsed.toString());
    console.log("Effective gas price:", ethers.formatUnits(effectiveGasPrice, "gwei"), "gwei");
    console.log("Real Cost:", ethers.formatEther(realCost), "ETH");
  }

  // 2️⃣ setV4Quoter (optional, network-specific)
  if (v4QuoterAddress) {
    console.log("\n--- setV4Quoter ---");
    const tx2 = await contract.setV4Quoter(v4QuoterAddress);
    const r2 = await tx2.wait();
    console.log("tx:", tx2.hash);
    console.log("gas:", r2!.gasUsed.toString());
    console.log("v4Quoter:", await contract.v4Quoter());
  } else {
    console.log("\n--- setV4Quoter ---");
    if (prefix) {
      console.log(`skip: ${prefix}_V4_QUOTER_ADDRESS / V4_QUOTER_ADDRESS is not set`);
    } else {
      console.log("skip: V4_QUOTER_ADDRESS is not set");
    }
  }

  const quoterEnvKey = prefix ? `${prefix}_QUOTER_ADDRESS` : "QUOTER_ADDRESS";

  console.log("\n✅ ArbQuoter deployed and configured");
  console.log(`   Address: ${address}`);
  console.log(`   V4 Quoter: ${v4QuoterAddress ?? "(not set)"}`);
  console.log(`\n   Add to .env:`);
  console.log(`   ${quoterEnvKey}=${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
