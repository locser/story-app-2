import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Oauth } from 'src/oauth/entities/oauth.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import UsersSearchService from './userSearchService.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

config();
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UsersSearchService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
  imports: [
    // SearchService,
    ElasticsearchModule.register({
      node: 'http://127.0.0.1:9200',
    }),
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
    ConfigModule,
  ],
  exports: [UserModule],
})
export class UserModule {}
