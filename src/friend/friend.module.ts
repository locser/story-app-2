import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { FriendRequest } from 'src/friend-request/entities/friend-request.entity';
import { FriendRequestModule } from 'src/friend-request/friend-request.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [
    UserModule,
    FriendRequestModule,
    TypeOrmModule.forFeature([User, FriendRequest]),
    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 25,
    }),
  ],
  exports: [FriendService],
})
export class FriendModule {}
