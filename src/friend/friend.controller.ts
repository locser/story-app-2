import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { SkipThrottle } from '@nestjs/throttler';

// @SkipThrottle()
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  getFriends(@Request() req) {
    console.log('Fetching Friends');
    const { user_id } = req.user;
    return this.friendService.getFriends(user_id);
  }

  @Delete(':toUser_id/delete')
  async deleteFriend(
    @Request() req,
    @Param('toUser_id', ParseIntPipe) toUser_id: number,
  ) {
    const user_id = req.user.user_id;
    return await this.friendService.deleteFriend(toUser_id, +user_id);
  }
}
