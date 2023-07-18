import { PartialType } from '@nestjs/swagger';
import { CreateOauthDto } from './create-oauth.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateOauthDto extends PartialType(CreateOauthDto) {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  access_token: string;

  @IsNotEmpty()
  status: number;
}
