import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { GatewaySessionManager } from './gateway.session';
import * as redisStore from 'cache-manager-redis-store';

import { ConversationModule } from 'src/conversation/conversation.module';
import { GatewayDB } from './entity/gatewayDB.entity';
import { GatewayService } from './gateway.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FriendModule } from 'src/friend/friend.module';
// import { GatewayService } from './gateway.service';

config();
@Module({
  imports: [
    FriendModule,
    ConversationModule,
    AuthModule,
    MessageModule,
    TypeOrmModule.forFeature([GatewayDB]),

    UserModule,
    MessageModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 25,
    }),
  ],
  providers: [
    MyGateway,
    {
      provide: 'GATEWAY_SESSION_MANAGER',
      useClass: GatewaySessionManager,
    },
    GatewayService,
  ],

  exports: [MyGateway],
})
export class GatewayModule {}
