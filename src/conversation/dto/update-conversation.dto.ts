import { PartialType } from '@nestjs/swagger';
import { CreateConversationDto } from './create-conversation.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
export class UpdateConversationDto extends PartialType(CreateConversationDto) {
  @IsNotEmpty()
  conversation_id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  avatar: string;

  @IsNotEmpty()
  members: number[];

  background: string;

  last_activity: number;

  @IsNotEmpty()
  status: number;
}
