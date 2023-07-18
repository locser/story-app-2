import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  user_id: number;

  avatar: string;

  name: string;

  lat: string;

  lng: string;

  country_id: number;

  city_id: number;

  district_id: number;

  ward_id: number;

  phone: string;

  gender: string;

  birthday: string;
}
