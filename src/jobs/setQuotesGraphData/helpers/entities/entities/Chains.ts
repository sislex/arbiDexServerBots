import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Tokens } from './Tokens';

@Index('chains_pkey', ['id'], { unique: true })
@Index('unique_chain_name', ['name'], { unique: true })
@Entity('chains', { schema: 'public' })
export class Chains {
  @Column('integer', { primary: true, name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @OneToMany(() => Tokens, (tokens) => tokens.chain)
  tokens: Tokens[];
}
