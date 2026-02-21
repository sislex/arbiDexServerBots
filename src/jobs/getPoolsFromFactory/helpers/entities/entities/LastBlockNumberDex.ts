import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dexes } from './Dexes';
@Entity('last_block_number_dex', { schema: 'public' })
export class LastBlockNumberDex {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column('integer', {
    name: 'block_number',
    nullable: true,
    default: null,
  })
  blockNumber: number | null;

  @Column('integer', { name: 'dex' })
  dex: number;

  @Column('character varying', { name: 'version', length: 255, nullable: true })
  version: string | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Dexes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'dex', referencedColumnName: 'dexId' })
  dexRelation: Dexes;
}
