// import { IsNotEmpty } from 'class-validator';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'message_id' })
  message_id: number;

  @Column({ type: 'bigint', name: 'conversation_id', default: 0 })
  conversation_id: number;

  @ManyToOne(
    () => Conversation,
    (conversation: Conversation) => conversation.message,
    // { eager: true, cascade: true },
  )
  @JoinColumn([
    { name: 'conversation_id', referencedColumnName: 'conversation_id' },
  ])
  conversation: Conversation;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'int', default: 0 })
  type: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  message: string;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;
}
