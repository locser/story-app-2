import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UserSearchBody } from './types/userSearchBody.interface';
import { User } from './entities/user.entity';
import { UserSearchResult } from './types/userSearchResult.interface';

@Injectable()
export default class UsersSearchService {
  index = 'users';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexUser(user: User) {
    return this.elasticsearchService.index<UserSearchBody>({
      index: this.index,
      body: {
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        country_id: user.country_id,
        avatar: user.avatar,
        district_id: user.district_id,
        ward_id: user.ward_id,
        gender: user.gender,
        birthday: user.birthday,
      },
    });
  }

  async search(text: string) {
    const body = await this.elasticsearchService.search<any>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            type: 'phrase_prefix',
            fields: ['phone', 'username', 'name'],
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
