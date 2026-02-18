import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tokens } from './Tokens';

@Index('swap_rate_pkey', ['swapRateId'], { unique: true })
@Index('unique_token_pair', ['swapRateToken0', 'swapRateToken1'], {
  unique: true,
})
@Entity('swap_rate', { schema: 'public' })
export class SwapRate {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'swap_rate_id' })
  swapRateId: number;

  @Column('integer', { name: 'swap_rate_token0', unique: true })
  swapRateToken0: number;

  @Column('integer', { name: 'swap_rate_token1', unique: true })
  swapRateToken1: number;

  @Column('integer', { name: 'swap_rate_count', default: () => '0' })
  swapRateCount: number;

  @ManyToOne(() => Tokens, (tokens) => tokens.swapRates0, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'swap_rate_token0', referencedColumnName: 'tokenId' }])
  swapRate0: Tokens;

  @ManyToOne(() => Tokens, (tokens) => tokens.swapRates1, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'swap_rate_token1', referencedColumnName: 'tokenId' }])
  swapRate1: Tokens;
}
