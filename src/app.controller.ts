import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

// @UseInterceptors(CacheInterceptor)
@Controller()
export class AppController {
  constructor(public appService: AppService) {}

  @Get()
  @CacheKey('some_awesome')
  @CacheTTL(30)
  async getHello() {
    return this.appService.getHello();
  }
}
