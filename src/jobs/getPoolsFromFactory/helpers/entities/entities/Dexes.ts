import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pools } from './Pools';

@Index('dexes_pkey', ['dexId'], { unique: true })
@Entity('dexes', { schema: 'public' })
export class Dexes {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'dex_id' })
  dexId: number;

  @Column('character varying', { name: 'name', length: 100 })
  name: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @OneToMany(() => Pools, (pools) => pools.dex)
  pools: Pools[];
}
