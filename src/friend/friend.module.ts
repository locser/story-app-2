import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  exports: [FriendService],
})
export class FriendModule {}
