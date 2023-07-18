import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from './entities/conversation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [ConversationController],
  providers: [
    ConversationService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [ConversationService],
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([User]),
  ],
})
export class ConversationModule {}
