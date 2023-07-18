import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
export class CreateConversationDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  avatar: string;

  members: number[];

  background: string;

  last_activity: number;

  @IsNotEmpty()
  status: number;
  //member 1 is currenrt user

  // @IsNotEmpty()
  // username: string;

  // @IsNotEmpty()
  // password: string;
}
