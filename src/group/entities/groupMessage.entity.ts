import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity({ name: 'group_messages' })
export class GroupMessage {
  @PrimaryGeneratedColumn()
  message_group_id: number;

  @Column('text', { nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;
  @Column('bigint', { nullable: false })
  user_id: number;

  @ManyToOne(() => Group, (group) => group.messages)
  group: Group;

  @Column({ type: 'int', default: 0 })
  type: number;

  @Column({ type: 'int', default: 0 })
  status: number;
}
