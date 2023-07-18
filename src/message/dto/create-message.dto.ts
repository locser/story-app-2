import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
export class CreateMessageDto {
  @IsNotEmpty()
  conversation_id: number;

  user_id: number;

  @IsNotEmpty()
  type: number;

  @IsString()
  message: string;

  status: number;
}
