import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chains } from './Chains';
import { Tokens } from './Tokens';

@Index('quotes_graph_pkey', ['id'], { unique: true })
@Entity('quotes_graph')
export class QuotesGraph {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chain_id', type: 'integer' })
  chainId: number;

  @ManyToOne(() => Chains, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chain_id' })
  chain: Chains;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'cost_buy', type: 'bigint' })
  costBuy: string;

  @Column({ name: 'cost_sell', type: 'bigint' })
  costSell: string;

  @Column({ name: 'token0', type: 'integer' })
  token0Id: number;

  @ManyToOne(() => Tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'token0' })
  token0: Tokens;

  @Column({ name: 'token1', type: 'integer' })
  token1Id: number;

  @ManyToOne(() => Tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'token1' })
  token1: Tokens;
}
