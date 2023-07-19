// import { CacheModule, Module } from '@nestjs/common';
// import { ConfigModule as NestJsConfigModule } from '@nestjs/config';
// import { redisStore } from 'cache-manager-redis-store';
// import { config } from 'dotenv';

// config();
// @Module({
//     imports: [
//         NestJsConfigModule.forRoot(),

//             CacheModule.registerAsync({
//             // @ts-ignore
//             useFactory: async () => {
//                 return {
//                 store: await redisStore({
//                     url: `redis://:${process.env.CONFIG_REDIS_PASSWORD}@${process.env.CONFIG_REDIS_HOST}:${process.env.CONFIG_REDIS_PORT}/${process.env.CONFIG_REDIS_DB}`,
//                 }),
//                 };
//             },
//             isGlobal: true,
//     }),
//     ],

// });
