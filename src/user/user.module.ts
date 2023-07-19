import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oauth } from 'src/oauth/entities/oauth.entity';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';

import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

config();
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
  imports: [
    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 25,
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Oauth]),
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [UserModule],
})
export class UserModule {}
