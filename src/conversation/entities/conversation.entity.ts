import { IsNotEmpty } from 'class-validator';
import { Message } from 'src/message/entities/message.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'conversation_id' })
  conversation_id: number;

  // @Column({ name: 'conversation_id', type: 'bigint' })
  // conversation_id: number;

  @OneToMany(() => Message, (mess: Message) => mess.conversation)
  public message: Message[];

  @Column({ type: 'text', default: 'conversation' })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', default: '' })
  @IsNotEmpty()
  avatar: string;

  @Column({ type: 'text', default: 0 })
  last_message_id: number;

  @IsNotEmpty()
  @Column('int', { array: true })
  members: number[];

  @Column({ type: 'text', default: 'background' })
  background: string;

  @Column({ type: 'int', default: 0 })
  last_activity: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;
}
