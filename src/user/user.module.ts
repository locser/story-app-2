import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oauth } from 'src/oauth/entities/oauth.entity';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { RedisModule, RedisService } from 'nestjs-redis';

config();
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Oauth]),
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    // RedisModule.register({
    //   host: 'localhost',
    //   port: 6379,
    //   password: 'your_password',
    //   db: 0,
    // }),
    // RedisModule,
    // RedisService,
    // CacheModule.registerAsync({
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   useFactory: async () => {
    //     return {
    //       store: await redisStore({
    //         url: `redis://:${process.env.CONFIG_REDIS_PASSWORD}@${process.env.CONFIG_REDIS_HOST}:${process.env.CONFIG_REDIS_PORT}/${process.env.CONFIG_REDIS_DB}`,
    //       }),
    //       ttl: process.env.CONFIG_REDIS_TTLS,
    //     };
    //   },
    //   isGlobal: true,
    // }),
  ],
  exports: [UserModule],
})
export class UserModule {}
