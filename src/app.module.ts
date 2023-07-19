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
import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';
import { RedisStore, redisStore } from 'cache-manager-redis-store';
// import { RedisStore } from 'cache-manager-redis-store';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as cacheManager from 'cache-manager';
// import * as redisStore from 'cache-manager-redis-store';
config();

@Module({
  imports: [
    CacheModule.registerAsync({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      useFactory: async () => {
        return {
          store: await redisStore({
            url: `redis://:${process.env.CONFIG_REDIS_PASSWORD}@${process.env.CONFIG_REDIS_HOST}:${process.env.CONFIG_REDIS_PORT}/${process.env.CONFIG_REDIS_DB}`,
          }),
        };
      },
      isGlobal: true,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
