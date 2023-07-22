// import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Gateway')
export class GatewayDB {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'gate_id' })
  gate_id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @Column({ type: 'text', name: 'socket_id', default: 0 })
  socket_id: string;

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;
}
