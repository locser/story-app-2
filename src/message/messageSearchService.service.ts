import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MessageSearchBody } from './types/messageSearchBody.interface';
import { Injectable } from '@nestjs/common';
import { Message } from 'src/message/entities/message.entity';
import { MessageSearchResult } from './types/messageSearchResult.interface';

@Injectable()
export default class MessageSearchService {
  index = 'messsages';
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexMessage(mess: Message) {
    return this.elasticsearchService.index<MessageSearchBody>({
      index: this.index,
      body: {
        message_id: mess.message_id,
        message: mess.message,
        conversation_id: mess.conversation_id,
        user_id: mess.user_id,
        type: mess.type,
        status: mess.status,
        timestamp: mess.timestamp.toString(),
      },
    });
  }
  async search(text: string, conversation_id: number) {
    const body = await this.elasticsearchService.search<any>({
      index: this.index,
      body: {
        query: {
          bool: {
            must: [
              { match: { message: text } },
              { match: { conversation_id: conversation_id } },
            ],
          },
        },
      },
    });
    console.log(body);
    console.log('- body messageSearchService');

    const hits = body.hits.hits;
    console.log(hits);
    console.log('- hits messageSearchService');

    return hits.map((item) => item._source);
  }
}
