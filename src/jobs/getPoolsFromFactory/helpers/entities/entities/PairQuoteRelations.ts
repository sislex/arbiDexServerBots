import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pairs } from './Pairs';
import { Quotes } from './Quotes';
import { QuoteJobRelations } from './QuoteJobRelations';

@Index('pair_quote_relations_pkey', ['pairQuoteRelationId'], { unique: true })
@Entity('pair_quote_relations', { schema: 'public' })
export class PairQuoteRelations {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'pair_quote_relation_id' })
  pairQuoteRelationId: string;

  @ManyToOne(() => Pairs, (pairs) => pairs.pairQuoteRelations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'pair_id', referencedColumnName: 'pairId' }])
  pair: Pairs;

  @ManyToOne(() => Quotes, (quotes) => quotes.pairQuoteRelations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'quote_id', referencedColumnName: 'quoteId' }])
  quote: Quotes;

  @OneToMany(
    () => QuoteJobRelations,
    (quoteJobRelations) => quoteJobRelations.quoteRelation,
  )
  quoteJobRelations: QuoteJobRelations[];
}
