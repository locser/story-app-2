import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { Oauth } from './entities/oauth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [OauthController],
  providers: [OauthService],
  imports: [TypeOrmModule.forFeature([Oauth])],
  exports: [OauthModule],
})
export class OauthModule {}
