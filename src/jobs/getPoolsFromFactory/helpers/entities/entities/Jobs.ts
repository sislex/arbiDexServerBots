import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bots } from './Bots';
import { Chains } from './Chains';
import { RpcUrls } from './RpcUrls';
import { QuoteJobRelations } from './QuoteJobRelations';

@Index('jobs_pkey', ['jobId'], { unique: true })
@Entity('jobs', { schema: 'public' })
export class Jobs {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'job_id' })
  jobId: string;

  @Column('character varying', {
    name: 'job_type',
    nullable: true,
    length: 255,
  })
  jobType: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('text', { name: 'extra_settings', nullable: true })
  extraSettings: string | null;

  @OneToMany(() => Bots, (bots) => bots.job)
  bots: Bots[];

  @ManyToOne(() => Chains, (chains) => chains.jobs, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'chain_id', referencedColumnName: 'chainId' }])
  chain: Chains;

  @ManyToOne(() => RpcUrls, (rpcUrls) => rpcUrls.jobs, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'rpc_url_id', referencedColumnName: 'rpcUrlId' }])
  rpcUrl: RpcUrls;

  @OneToMany(
    () => QuoteJobRelations,
    (quoteJobRelations) => quoteJobRelations.job,
  )
  quoteJobRelations: QuoteJobRelations[];
}
