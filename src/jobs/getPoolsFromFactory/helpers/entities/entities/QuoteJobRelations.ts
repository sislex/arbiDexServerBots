import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Jobs } from './Jobs';
import { PairQuoteRelations } from './PairQuoteRelations';

@Index('quote_job_relations_pkey', ['quoteJobRelationId'], { unique: true })
@Entity('quote_job_relations', { schema: 'public' })
export class QuoteJobRelations {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'quote_job_relation_id' })
  quoteJobRelationId: string;

  @ManyToOne(() => Jobs, (jobs) => jobs.quoteJobRelations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'job_id', referencedColumnName: 'jobId' }])
  job: Jobs;

  @ManyToOne(
    () => PairQuoteRelations,
    (pairQuoteRelations) => pairQuoteRelations.quoteJobRelations,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
  )
  @JoinColumn([
    { name: 'quote_relation_id', referencedColumnName: 'pairQuoteRelationId' },
  ])
  quoteRelation: PairQuoteRelations;
}
