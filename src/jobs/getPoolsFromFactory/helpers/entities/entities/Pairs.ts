import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PairQuoteRelations } from './PairQuoteRelations';
import { Pools } from './Pools';
import { Tokens } from './Tokens';

@Index('pairs_pkey', ['pairId'], { unique: true })
@Entity('pairs', { schema: 'public' })
export class Pairs {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'pair_id' })
  pairId: string;

  @OneToMany(
    () => PairQuoteRelations,
    (pairQuoteRelations) => pairQuoteRelations.pair,
  )
  pairQuoteRelations: PairQuoteRelations[];

  @ManyToOne(() => Pools, (pools) => pools.pairs, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'pool_id', referencedColumnName: 'poolId' }])
  pool: Pools;

  @ManyToOne(() => Tokens, (tokens) => tokens.pairs, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'token_in', referencedColumnName: 'tokenId' }])
  tokenIn: Tokens;

  @ManyToOne(() => Tokens, (tokens) => tokens.pairs2, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'token_out', referencedColumnName: 'tokenId' }])
  tokenOut: Tokens;
}
