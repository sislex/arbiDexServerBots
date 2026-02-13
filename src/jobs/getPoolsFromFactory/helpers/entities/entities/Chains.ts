import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Jobs } from './Jobs';
import { Pools } from './Pools';
import { RpcUrls } from './RpcUrls';
import { Tokens } from './Tokens';

@Index('chains_pkey', ['chainId'], { unique: true })
@Entity('chains', { schema: 'public' })
export class Chains {
  @Column('integer', { primary: true, name: 'chain_id' })
  chainId: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @OneToMany(() => Jobs, (jobs) => jobs.chain)
  jobs: Jobs[];

  @OneToMany(() => Pools, (pools) => pools.chain)
  pools: Pools[];

  @OneToMany(() => RpcUrls, (rpcUrls) => rpcUrls.chain)
  rpcUrls: RpcUrls[];

  @OneToMany(() => Tokens, (tokens) => tokens.chain)
  tokens: Tokens[];
}
