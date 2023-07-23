import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Request,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //test for elastic search username

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Delete('/deleteCache')
  deleteCache() {
    return this.userService.deleteCache();
  }

  @Public()
  @Post('login')
  login(@Body() createUserDto: Record<string, any>) {
    //login
    return this.userService.signIn(createUserDto);
  }

  @Get('nearMe')
  // @CacheKey(`nearMe_${}`) // Sử dụng 'user:id' làm khóa cache
  // @CacheTTL(30) // Dữ liệu cache sẽ tồn tại trong 60 giây
  userNearMe(@Body() body, @Request() req) {
    const { radius, numberUserNearMe } = body;
    const user_id = req.user.user_id;

    return this.userService.findNearMe(+radius, +user_id, +numberUserNearMe);
  }

  @Get('searchUserElasticsearch')
  elasticSearchUser(@Body() body, @Request() req) {
    const { text } = body;
    const { user_id } = req.user;
    return this.userService.searchForUserElasticsearch(text, +user_id);
  }

  // @Get('sendFriendRequest/:user_id')
  // sendFriendRequest(@Param('user_id') user_id: number, @Request() req) {
  //   return this.userService.sendFriendRequest(+user_id, +req.user.user_id);
  // }

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
}
