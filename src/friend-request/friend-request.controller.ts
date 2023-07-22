import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('friend-request')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}
  @Throttle(3, 10) //giới hạn số lần một yêu cầu được gửi trong một khoảng thời gian nhất định.
  @Post() // giới hạn 3 lần cho 10s
  create(@Body() body: CreateFriendRequestDto, @Request() request) {
    const user_id = request.user.user_id;
    return this.friendRequestService.create(body, +user_id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.friendRequestService.findOne(+id);
  // }
  @Throttle(3, 10)
  @Get()
  getFriendRequests(@Request() req) {
    const user_id = req.user.user_id;
    return this.friendRequestService.getFriendRequests(+user_id);
  }
  @Throttle(3, 10)
  @Post(':request_id/accept')
  async acceptFriendRequest(
    @Request() req,
    @Param('request_id', ParseIntPipe) request_id: number,
  ) {
    const user_id = req.user.user_id;
    return this.friendRequestService.accept(request_id, +user_id);
  }

  @Throttle(3, 10)
  @Delete(':request_id/cancel')
  async cancelFriendRequest(
    @Request() req,
    @Param('request_id', ParseIntPipe) request_id: number,
  ) {
    const { user_id } = req.user;
    return await this.friendRequestService.cancel(request_id, user_id);
  }

  @Throttle(3, 10)
  @Delete(':request_id/reject')
  async rejectFriendRequest(
    @Request() req,
    @Param('request_id', ParseIntPipe) request_id: number,
  ) {
    const user_id = req.user.user_id;

    return await this.friendRequestService.reject(request_id, user_id);
  }

  // @Get()
  // findAll() {
  //   return this.friendRequestService.findAll();
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateFriendRequestDto: UpdateFriendRequestDto,
  // ) {
  //   return this.friendRequestService.update(+id, updateFriendRequestDto);
  // }
}
