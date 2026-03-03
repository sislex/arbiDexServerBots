import { ethers } from 'ethers';

const pk = process.env.PRIVATE_KEY!;
const w = new ethers.Wallet('0x' + pk);
console.log('Our wallet address:', w.address);
console.log('ConfigStore owner:  0x90F0fE019Dd68e4bF4dacA998f00C758F7DF4ADE');
console.log('Match:', w.address.toLowerCase() === '0x90F0fE019Dd68e4bF4dacA998f00C758F7DF4ADE'.toLowerCase());

