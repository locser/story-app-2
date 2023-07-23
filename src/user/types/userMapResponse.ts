import { Expose } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserMapResponse {
  user_id: number;
  name: string;
  phone: string;
  avatar: string;
  gender: string;
  username: string;

  constructor(user: User) {
    this.user_id = user.user_id;
    this.name = user.name;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.username = user.username;
    this.gender = user.gender;
  }
}
