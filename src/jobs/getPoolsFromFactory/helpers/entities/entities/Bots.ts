import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Jobs } from './Jobs';
import { Servers } from './Servers';

@Index('bots_pkey', ['botId'], { unique: true })
@Entity('bots', { schema: 'public' })
export class Bots {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'bot_id' })
  botId: string;

  @Column('character varying', {
    name: 'bot_name',
    nullable: true,
    length: 255,
  })
  botName: string | null;

  @Column('character varying', {
    name: 'description',
    nullable: true,
    length: 255,
  })
  description: string | null;

  @Column('boolean', { name: 'paused', nullable: true })
  paused: boolean | null;

  @Column('boolean', { name: 'is_repeat', nullable: true })
  isRepeat: boolean | null;

  @Column('integer', { name: 'delay_between_repeat', nullable: true })
  delayBetweenRepeat: number | null;

  @Column('integer', { name: 'max_jobs', nullable: true })
  maxJobs: number | null;

  @Column('integer', { name: 'max_errors', nullable: true })
  maxErrors: number | null;

  @Column('integer', { name: 'timeout_ms', nullable: true })
  timeoutMs: number | null;

  @ManyToOne(() => Jobs, (jobs) => jobs.bots, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'job_id', referencedColumnName: 'jobId' }])
  job: Jobs;

  @ManyToOne(() => Servers, (servers) => servers.bots, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'server_id', referencedColumnName: 'serverId' }])
  server: Servers;
}
