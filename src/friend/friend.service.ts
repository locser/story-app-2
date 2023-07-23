import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from 'src/friend-request/entities/friend-request.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserMapResponse } from 'src/user/types/userMapResponse';
import { ResponseMap } from './../utils/responseMap';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  //get friends by current user
  async getFriends(user_id: number): Promise<any> {
    const friendRequests = await this.friendRequestRepository
      .createQueryBuilder('friend_request')
      .where('friend_request.status =1')
      .leftJoinAndSelect('friend_request.sender', 'sender')
      .leftJoinAndSelect('friend_request.receiver', 'receiver')
      .andWhere('(sender.user_id = :user_id OR receiver.user_id = :user_id)', {
        user_id,
      })
      .getMany();

    const users = friendRequests.flatMap((request) => [
      request.sender,
      request.receiver,
    ]);

    const userResponse = users
      .filter((user) => user.user_id !== user_id)
      .map((user) => new UserMapResponse(user));
    //bắn EvenEmitter qua cho
    return new ResponseMap(
      friendRequests.length > 0 ? 'Danh sách bạn bè' : 'Bạn chưa có bạn bè!',
      userResponse,
      200,
    );
  }

  async findFriendById(user_id: number): Promise<any> {
    const user: User = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    return new ResponseMap('Thông tin bạn bè', user, 200);
  }

  async deleteFriend(toUser_id: number, user_id: number) {
    const friendRequest = await this.friendRequestRepository
      .createQueryBuilder('request')
      .where(
        '(request.sender = :user_id AND request.receiver = :toUser_id) OR (request.sender = :toUser_id AND request.receiver = :user_id)',
        { user_id, toUser_id },
      )
      .andWhere('(request.status = 0)')
      .getOne();

    if (friendRequest.status === 0) {
      return new ResponseMap(
        'Không phải là bạn bè của nhau, không thể thực hiện hành động',
        [],
        200,
      );
      //delete friend in friend list
    }

    await this.friendRequestRepository.delete(friendRequest.request_id);

    return { message: 'xóa bạn bè thành công!', data: [], status: 'success' };
  }
}
