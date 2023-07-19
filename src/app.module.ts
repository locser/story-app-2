import { Module } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation/entities/conversation.entity';
import { MessageModule } from './message/message.module';
import { Message } from './message/entities/message.entity';
import { OauthModule } from './oauth/oauth.module';
import { UserModule } from './user/user.module';
import { Oauth } from './oauth/entities/oauth.entity';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { config } from 'dotenv';
// import { RedisStore } from 'cache-manager-redis-store';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
config();

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 25,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Loc123@@',
      database: 'overate-app',
      entities: [Conversation, Message, User, Oauth],
      // synchronize: true,
      // autoLoadEntities: true,
    }),

    ConversationModule,
    MessageModule,
    OauthModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //TODO: interceptor redis
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})
export class AppModule {}
