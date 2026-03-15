import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { GraphChains } from './Chains';

@Unique('unique_token_address_chain', ['address', 'chain'])
@Index('tokens_pkey', ['id'], { unique: true })
@Entity('tokens', { schema: 'public' })
export class GraphTokens {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

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

  @ManyToOne(() => GraphChains, (chains) => chains.tokens, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'chain_id', referencedColumnName: 'id' }])
  chain: GraphChains;
}
