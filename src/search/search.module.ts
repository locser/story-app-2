import { Module, OnModuleInit } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { SearchService } from './search.service';
// import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://127.0.0.1:9200',
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class SearchModule {}
