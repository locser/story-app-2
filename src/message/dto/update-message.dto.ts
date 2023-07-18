import { PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsNotEmpty()
  message_id: number;

  @IsString()
  @IsNotEmpty()
  converation_id: number;

  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  type: number;

  @IsString()
  message: string;

  status: number;
}
