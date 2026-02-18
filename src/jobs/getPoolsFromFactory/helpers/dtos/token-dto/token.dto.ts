export class TokenDto {
  tokenId: number;
  address: string;
  symbol: string;
  tokenName: string;
  decimals: number;
  chainId: number;
}

export class CreateTokenDto {
  address: string;
  chainId: number;
  symbol: string;
  tokenName: string;
  decimals: number;
  isActive?: boolean | null;
  isChecked?: boolean | null;
  balance?: boolean | null;
}
