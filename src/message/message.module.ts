import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import MessageSearchService from './messageSearchService.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageSearchService],
  imports: [
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
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([Conversation]),
  ],
})
export class MessageModule {}
