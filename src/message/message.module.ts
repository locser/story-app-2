import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ConversationModule } from 'src/conversation/conversation.module';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([Conversation]),
  ],
})
export class MessageModule {}
