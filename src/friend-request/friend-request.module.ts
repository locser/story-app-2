import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([FriendRequest]),
    TypeOrmModule.forFeature([User]),
  ],
})
export class FriendRequestModule {}
