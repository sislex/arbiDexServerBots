import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('dexes_pkey', ['id'], { unique: true })
@Index('unique_dex_name', ['name'], { unique: true })
@Entity('dexes', { schema: 'public' })
export class Dexes {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 100 })
  name: string;
}
