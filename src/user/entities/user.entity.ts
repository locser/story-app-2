import { IsNotEmpty } from 'class-validator';
import { Message } from 'src/message/entities/message.entity';
import { Oauth } from 'src/oauth/entities/oauth.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  user_id: number;

  @OneToMany(() => Oauth, (oauth: Oauth) => oauth.user)
  public oauth: Oauth[];

  // @OneToMany(() => Message, (oauth: Message) => oauth.user)
  // public message: Message[];

  @Column({ type: 'text', default: '' })
  avatar: string;

  @Column({ type: 'varchar', default: '' })
  name: string;

  @Column({ type: 'text', default: '' })
  lat: string;

  @Column({ type: 'text', default: '' })
  lng: string;

  @Column({ type: 'int', default: 0 })
  country_id: number;

  @Column({ type: 'int', default: 0 })
  city_id: number;

  @Column({ type: 'int', default: 0 })
  district_id: number;

  @Column({ type: 'int', default: 0 })
  ward_id: number;

  @Column({ type: 'varchar', default: '' })
  phone: string;

  @Column({ type: 'varchar', default: '' })
  gender: string;

  @Column({ type: 'text', default: '' })
  birthday: string;

  @Column({ type: 'timestamp', default: new Date() })
  timestamp: Date;

  @Column({ type: 'text' })
  @IsNotEmpty()
  username: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  password: string;

  @Column('int', { array: true, default: [] })
  friends: number[];
}
