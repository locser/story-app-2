import { IsNotEmpty } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  request_id: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  @IsNotEmpty()
  sender: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  @IsNotEmpty()
  receiver: User;

  @Column({ type: 'int', default: 0 })
  status: number; // 0 is request friend 1 is friend

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;
}
