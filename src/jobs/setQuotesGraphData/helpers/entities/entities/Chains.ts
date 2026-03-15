import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GraphTokens } from './Tokens';

@Index('chains_pkey', ['id'], { unique: true })
@Index('unique_chain_name', ['name'], { unique: true })
@Entity('chains', { schema: 'public' })
export class GraphChains {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @OneToMany(() => GraphTokens, (tokens) => tokens.chain)
  tokens: GraphTokens[];
}
