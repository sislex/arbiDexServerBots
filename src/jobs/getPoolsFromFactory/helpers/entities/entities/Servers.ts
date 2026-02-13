import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bots } from './Bots';

@Index('servers_pkey', ['serverId'], { unique: true })
@Entity('servers', { schema: 'public' })
export class Servers {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'server_id' })
  serverId: string;

  @Column('character varying', { name: 'ip', nullable: true, length: 255 })
  ip: string | null;

  @Column('character varying', { name: 'port', nullable: true, length: 255 })
  port: string | null;

  @Column('character varying', {
    name: 'server_name',
    nullable: true,
    length: 255,
  })
  serverName: string | null;

  @OneToMany(() => Bots, (bots) => bots.server)
  bots: Bots[];
}
