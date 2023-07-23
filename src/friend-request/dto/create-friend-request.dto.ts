import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}
