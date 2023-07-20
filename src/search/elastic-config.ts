import { ClientOptions } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { ElasticsearchOptionsFactory } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticConfig implements ElasticsearchOptionsFactory {
  createElasticsearchOptions(): ClientOptions | Promise<ClientOptions> {
    return {
      node: 'http://172.16.10.74:9200',
    };
  }
}
