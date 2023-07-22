import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  request_id: number;

  @Column({ type: 'bigint' })
  @IsNotEmpty()
  user_id: number;

  @Column({ type: 'bigint' })
  @IsNotEmpty()
  toUser_id: number;

  @Column({ type: 'int', default: 0 })
  status: number; // 0 is request friend 1 is friend

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;
}
