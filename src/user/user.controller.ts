import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/auth/auth.guard';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Delete('/deleteCache')
  deleteCache() {
    return this.userService.deleteCache();
  }
  @Get('/connectRedis')
  connectRedis() {
    return this.userService.connectRedis();
  }

  @Public()
  @Post('login')
  login(@Body() createUserDto: Record<string, any>) {
    //login
    return this.userService.signIn(createUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }

  //Redis
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(6) // Dữ liệu cache sẽ tồn tại trong 60 giây
  // @CacheKey('nearMe') // Sử dụng 'user:id' làm khóa cache
  @Get('nearMe')
  // @CacheKey(`nearMe_${}`) // Sử dụng 'user:id' làm khóa cache
  // @CacheTTL(30) // Dữ liệu cache sẽ tồn tại trong 60 giây
  userNearMe(@Body() body, @Request() req) {
    const { radius, numberUserNearMe } = body;
    const user_id = req.user.user_id;

    return this.userService.findNearMe(+radius, +user_id, +numberUserNearMe);
  }
}
