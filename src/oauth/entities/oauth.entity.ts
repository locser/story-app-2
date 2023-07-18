import { IsNotEmpty } from 'class-validator';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Oauth {
  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @ManyToOne(() => User, (user: User) => user.oauth)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'user_id' }])
  user: User;

  @Column({ type: 'text', default: '' })
  access_token: string;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;
}
