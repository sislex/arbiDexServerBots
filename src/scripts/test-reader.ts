import { ethers } from 'ethers';
import SwapStepsConfigReaderAbi from '../artifacts/contracts/SwapStepsConfigReader.sol/SwapStepsConfigReader.json';
import SwapStepsConfigStoreAbi from '../artifacts/contracts/SwapStepsConfigStore.sol/SwapStepsConfigStore.json';

const READER = '0x468fc19a6D226963275D94ee6Dbb70Be1920675F';

async function main() {
  const rpcUrl = process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const pk = process.env.PRIVATE_KEY!;
  const wallet = new ethers.Wallet('0x' + pk);
  console.log('Our wallet:', wallet.address);

  const reader = new ethers.Contract(READER, SwapStepsConfigReaderAbi.abi, provider);

  // 1) Получаем адреса из Reader
  const configStoreAddr = await reader.configStore();
  console.log('configStore:', configStoreAddr);
  const executorAddr = await reader.executor();
  console.log('executor:   ', executorAddr);
  const ownerAddr = await reader.owner();
  console.log('owner:      ', ownerAddr);

  // 2) Подключаемся к ConfigStore и проверяем что там есть
  const configStore = new ethers.Contract(configStoreAddr, SwapStepsConfigStoreAbi.abi, provider);
  const keysCount = await configStore.getKeysCount();
  console.log('\nConfigStore keysCount:', keysCount.toString());

  if (keysCount > 0n) {
    const allKeys = await configStore.getAllKeys();
    console.log('All keys:', allKeys);

    // Читаем первый ключ через Reader
    const firstKey = allKeys[0];
    console.log('\nReading config for first key:', firstKey);
    const config = await reader.getConfig(firstKey);
    console.log('Config length:', config.length);
    console.log('Config:', JSON.stringify(config, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  } else {
    console.log('\n⚠️  ConfigStore ПУСТОЙ — нет ни одного ключа.');
    console.log('Нужно записать конфиги через setConfig().');
    console.log('Owner ConfigStore:', await configStore.owner());
  }
}

main().catch(console.error);


