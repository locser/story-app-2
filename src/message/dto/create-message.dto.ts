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

  @IsNotEmpty()
  type: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  status: number;
}
