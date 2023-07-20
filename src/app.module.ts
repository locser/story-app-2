import { Module } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConversationModule } from './conversation/conversation.module';
import { Conversation } from './conversation/entities/conversation.entity';
import { Message } from './message/entities/message.entity';
import { MessageModule } from './message/message.module';
import { Oauth } from './oauth/entities/oauth.entity';
import { OauthModule } from './oauth/oauth.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
// import { RedisStore } from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
config();

@Module({
  imports: [
    // ConfigModule.forRoot(), // Make sure to import ConfigModule
    // ElasticsearchModule.registerAsync({
    //   imports: [ConfigModule], // Import ConfigModule here as well
    //   useFactory: async (configService: ConfigService) => ({
    //     node: configService.get('ELASTICSEARCH_NODE'), // Set the Elasticsearch node URL from the configuration
    //     auth: {
    //       username: configService.get('ELASTICSEARCH_USERNAME'), // Set the username if needed
    //       password: configService.get('ELASTICSEARCH_PASSWORD'), // Set the password if needed
    //     },
    //   }),
    //   inject: [ConfigService], // Inject ConfigService to use it in the useFactory function
    // }),

    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 25,
    }),

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

    ConversationModule,
    MessageModule,
    OauthModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //TODO: interceptor redis
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
  exports: [],
})
export class AppModule {}
