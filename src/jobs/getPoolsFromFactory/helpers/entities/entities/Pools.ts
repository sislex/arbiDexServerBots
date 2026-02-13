import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pairs } from './Pairs';
import { Chains } from './Chains';
import { Dexes } from './Dexes';
import { Tokens } from './Tokens';

@Index('unique_pool_address', ['poolAddress'], { unique: true })
@Index('pools_pkey', ['poolId'], { unique: true })
@Entity('pools', { schema: 'public' })
export class Pools {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'pool_id' })
  poolId: number;

  @Column('integer', { name: 'fee' })
  fee: number;

  @Column('character varying', { name: 'version', nullable: true, length: 2 })
  version: string | null;

  @Column('character varying', {
    name: 'pool_address',
    nullable: true,
    unique: true,
  })
  poolAddress: string | null;

  @Column('numeric', { name: 'reserve0', nullable: true })
  reserve0: string | null;

  @Column('numeric', { name: 'reserve1', nullable: true })
  reserve1: string | null;

  @OneToMany(() => Pairs, (pairs) => pairs.pool)
  pairs: Pairs[];

  @ManyToOne(() => Chains, (chains) => chains.pools, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'chain_id', referencedColumnName: 'chainId' }])
  chain: Chains;

  @ManyToOne(() => Dexes, (dexes) => dexes.pools, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'dex_id', referencedColumnName: 'dexId' }])
  dex: Dexes;

  @ManyToOne(() => Tokens, (tokens) => tokens.pools, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'token0', referencedColumnName: 'tokenId' }])
  token0: Tokens;

  @ManyToOne(() => Tokens, (tokens) => tokens.pools2, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'token1', referencedColumnName: 'tokenId' }])
  token1: Tokens;
}
