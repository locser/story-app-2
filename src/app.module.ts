import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConversationModule,
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
    MessageModule,
    OauthModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
