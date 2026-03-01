import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Pairs } from './Pairs';
import { Pools } from './Pools';
import { Quotes } from './Quotes';
import { SwapRate } from './SwapRate';
import { Chains } from './Chains';

@Unique('unique_token_address_chain', ['address', 'chain'])
@Index('tokens_pkey', ['tokenId'], { unique: true })
@Entity('tokens', { schema: 'public' })
export class Tokens {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'token_id' })
  tokenId: number;

  @Column('character varying', { name: 'address', length: 255 })
  address: string;

  @Column('character varying', { name: 'symbol', length: 255 })
  symbol: string;

  @Column('integer', { name: 'decimals' })
  decimals: number;

  @Column('character varying', {
    name: 'token_name',
    nullable: true,
    length: 255,
  })
  tokenName: string | null;

  @Column('boolean', { name: 'is_active', nullable: true })
  isActive: boolean | null;

  @Column('boolean', { name: 'is_checked', nullable: true })
  isChecked: boolean | null;

  @Column('boolean', { name: 'balance', nullable: true })
  balance: boolean | null;

  @OneToMany(() => Pairs, (pairs) => pairs.tokenIn)
  pairs: Pairs[];

  @OneToMany(() => Pairs, (pairs) => pairs.tokenOut)
  pairs2: Pairs[];

  @OneToMany(() => Pools, (pools) => pools.token0)
  pools: Pools[];

  @OneToMany(() => Pools, (pools) => pools.token1)
  pools2: Pools[];

  @OneToMany(() => Quotes, (quotes) => quotes.token)
  quotes: Quotes[];

  @OneToMany(() => SwapRate, (swapRate) => swapRate.swapRateToken0)
  swapRates0: SwapRate[];

  @OneToMany(() => SwapRate, (swapRate) => swapRate.swapRateToken1)
  swapRates1: SwapRate[];

  @ManyToOne(() => Chains, (chains) => chains.tokens, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'chain_id', referencedColumnName: 'chainId' }])
  chain: Chains;
}
