import { network } from "hardhat";

export async function resolveQuoter(quoterEnvKey: string) {
  const { ethers } = await network.connect();
  const deployLocalOnFork = network.name === "hardhat" && process.env.USE_DEPLOYED_QUOTER_ON_FORK !== "1";

  if (deployLocalOnFork) {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ArbQuoter", owner);
    const quoter = await factory.deploy(owner.address);
    await quoter.waitForDeployment();

    const v4Quoter = process.env.V4_QUOTER_ADDRESS || process.env.ARBITRUM_V4_QUOTER_ADDRESS;
    if (v4Quoter) {
      await (await quoter.setV4Quoter(ethers.getAddress(v4Quoter))).wait();
    }

    return {
      quoter,
      quoterAddress: await quoter.getAddress(),
      deployedLocally: true,
    };
  }

  const quoterAddress = process.env[quoterEnvKey] || process.env.QUOTER_ADDRESS;
  if (!quoterAddress) {
    throw new Error(`Missing ${quoterEnvKey} or QUOTER_ADDRESS in .env`);
  }

  const code = await ethers.provider.getCode(quoterAddress);
  if (code === "0x") {
    throw new Error(`No contract code at quoter ${quoterAddress} on current network/fork.`);
  }

  return {
    quoter: await ethers.getContractAt("ArbQuoter", quoterAddress),
    quoterAddress,
    deployedLocally: false,
  };
}
