import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { ConversaitonSearchBody } from './types/conversationSearchBody.interface';

@Injectable()
export default class ConversationSearchService {
  index = 'conversations';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexUser(conversation: Conversation) {
    return this.elasticsearchService.index<ConversaitonSearchBody>({
      index: this.index,
      body: {
        conversation_id: conversation.conversation_id,
        members: conversation.members,
        name: conversation.name,
      },
    });
  }

  async search(text: string) {
    const body = await this.elasticsearchService.search<any>({
      index: this.index,
      body: {
        query: {
          match: {
            type: 'phrase_prefix',
            name: text,
          },
        },
      },
    });
    console.log(body);
    console.log('- body userSearchService');

    const hits = body.hits.hits;
    console.log(hits);
    console.log('- hits userSearchService');

    return hits.map((item) => item._source);
  }
  //Trong truy vấn này:

  // "bool" là một câu truy vấn kiểm tra logic.
  // "should" là một điều kiện logic, nghĩa là ít nhất một trong các điều kiện nằm trong should phải đúng để kết quả trả về.
  // Trong "should", chúng ta sử dụng "multi_match" để kiểm tra đoạn text với các trường phone, username, và name.
}
