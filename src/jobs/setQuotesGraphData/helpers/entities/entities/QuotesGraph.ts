import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GraphChains } from './Chains';
import { GraphTokens } from './Tokens';

@Index('quotes_graph_pkey', ['id'], { unique: true })
@Entity('quotes_graph')
export class QuotesGraph {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chain_id', type: 'integer' })
  chainId: number;

  @ManyToOne(() => GraphChains, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chain_id' })
  chain: GraphChains;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({
    name: 'cost_buy',
    type: 'numeric',
    precision: 40,
    scale: 0,
  })
  costBuy: string;

  @Column({
    name: 'cost_sell',
    type: 'numeric',
    precision: 40,
    scale: 0,
  })
  costSell: string;

  @Column({ name: 'token0', type: 'integer' })
  token0Id: number;

  @ManyToOne(() => GraphTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'token0' })
  token0: GraphTokens;

  @Column({ name: 'token1', type: 'integer' })
  token1Id: number;

  @ManyToOne(() => GraphTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'token1' })
  token1: GraphTokens;
}
