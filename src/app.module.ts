import { Module } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConversationModule } from './conversation/conversation.module';
import { Conversation } from './conversation/entities/conversation.entity';
import { Message } from './message/entities/message.entity';
import { MessageModule } from './message/message.module';
import { Oauth } from './oauth/entities/oauth.entity';
import { OauthModule } from './oauth/oauth.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { GatewayModule } from './gateway/gateway.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendModule } from './friend/friend.module';
import { FriendRequest } from './friend-request/entities/friend-request.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewayDB } from './gateway/entity/gatewayDB.entity';

config();

@Module({
  imports: [
    GatewayModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Loc123@@',
      database: 'overate-app',
      entities: [Conversation, Message, User, Oauth, FriendRequest, GatewayDB],
      synchronize: true,
      // autoLoadEntities: true,
    }),

    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 25,
    }),
    EventEmitterModule.forRoot({
      wildcard: true, // Cho phép phát ra tất cả các sự kiện với ký tự đại diện (*)
      delimiter: '.', // Ký tự phân tách các phần của tên sự kiện (ví dụ: 'user.created')
    }),

    ConversationModule,
    MessageModule,
    OauthModule,
    UserModule,
    AuthModule,
    FriendRequestModule,
    FriendModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //TODO: interceptor redis
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [],
})
export class AppModule {}
