import { Message } from 'src/message/entities/message.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMessage } from './groupMessage.entity';
@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title?: string;

  // @ManyToMany(() => User, (user) => user.groups)
  // @JoinTable()
  // users: User[];

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  creator: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  owner: User;

  @OneToMany(() => GroupMessage, (message) => message.group, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages: GroupMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @OneToMany(() => Message, (mess: Message) => mess.conversation)
  lastMessageSent: Message;

  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt: Date;

  @Column({ nullable: true, default: 'avatar default' })
  avatar?: string;
  @Column({ nullable: true, default: 'default background' })
  background: string;
}
