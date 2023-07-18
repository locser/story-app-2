import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
export class CreateOauthDto {
  @IsNotEmpty()
  user_id: number;
  @IsNotEmpty()
  access_token: string;
}
