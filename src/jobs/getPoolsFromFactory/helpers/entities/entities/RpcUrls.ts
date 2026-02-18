import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Jobs } from './Jobs';
import { Chains } from './Chains';

@Index('rpc_urls_pkey', ['rpcUrlId'], { unique: true })
@Entity('rpc_urls', { schema: 'public' })
export class RpcUrls {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'rpc_url_id' })
  rpcUrlId: number;

  @Column('text', { name: 'rpc_url' })
  rpcUrl: string;

  @OneToMany(() => Jobs, (jobs) => jobs.rpcUrl)
  jobs: Jobs[];

  @ManyToOne(() => Chains, (chains) => chains.rpcUrls, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'chain_id', referencedColumnName: 'chainId' }])
  chain: Chains;
}
