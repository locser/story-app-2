import { Injectable, Post } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ResponseMap } from './../utils/responseMap';
import { UserService } from 'src/user/user.service';
import { UserNotFoundException } from 'src/user/exceptions/userException';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    private userService: UserService,
  ) {}

  async create(currentUser: User, usernameRequest: string) {
    try {
      if (currentUser.username === usernameRequest) {
        return 'Không thể tự kết bạn với bản thân!';
      }

      const receiver = await this.userService.findByUsername(usernameRequest);

      if (!receiver) throw new UserNotFoundException();

      const result = await this.findFriendRequest(
        currentUser.user_id,
        receiver.user_id,
      );

      if (result) {
        if (result.status === 1)
          return new ResponseMap('Hai người đã là bạn bè!', [], 200);
        if (result.receiver.user_id === currentUser.user_id)
          return new ResponseMap(
            'Người này đã gửi lời mời cho bạn trước đó rồi',
            [],
            200,
          );
      } else {
        const newRequestFriend = this.friendRequestRepository.save({
          sender: currentUser,
          receiver: receiver,
        });

        if (!newRequestFriend) {
          return new ResponseMap('Gửi lời mời kết bạn thất bại', [], 200);
        }
        return new ResponseMap('Gửi lời mời kết bạn thành công', [], 200);
      }
    } catch (error) {
      console.error(error);
    }
  }

  findFriendRequest(user_id: number, toUser_id: number) {
    return this.friendRequestRepository
      .createQueryBuilder('request')
      .where(
        '(request.sender = :user_id AND request.receiver = :toUser_id) OR (request.sender = :toUser_id AND request.receiver = :user_id)',
        { user_id, toUser_id },
      )
      .getOne();
  }

  checkFriend(user_id: number, toUser_id: number) {
    return this.friendRequestRepository
      .createQueryBuilder('request')
      .where(
        '(request.sender = :user_id AND request.receiver = :toUser_id) OR (request.sender = :toUser_id AND request.receiver = :user_id)',
        { user_id, toUser_id },
      )
      .andWhere('(request.status = 0)')
      .getOne();
  }

  async getFriendRequests(user_id: number): Promise<any> {
    const requestFriends = await this.friendRequestRepository
      .createQueryBuilder('request')
      .where('request.status = 0')
      .andWhere('request.toUser_id = :user_id', { user_id })
      .leftJoinAndSelect('request.user', 'user')
      .getMany();

    return new ResponseMap(
      requestFriends.length > 0
        ? 'Lấy danh sách lời mời kết bạn thành công'
        : 'Bạn không có lời mời kết bạn nào!',
      requestFriends,
      200,
    );
  }

  /***
   * Người dùng hiện tại đồng ý lời mời kết bạn của người gửi
   * user_id : người dùng hiện tại
   * request_id: id của request-friend
   */
  async accept(request_id: number, user_id: number): Promise<any> {
    try {
      const friendRequest = await this.findById(request_id);

      if (!friendRequest)
        return new ResponseMap('Không tìm thấy yêu cầu kết bạn!', [], 200);
      if (friendRequest.status === 1)
        return new ResponseMap('Hai người đã là bạn bè!', [], 200);

      if (friendRequest.receiver.user_id !== user_id)
        return new ResponseMap('Lỗi chấp nhận kết bạn', [], 200);

      friendRequest.status = 1;
      const updatedFriendRequest = await this.friendRequestRepository.save(
        friendRequest,
      );
      if (updatedFriendRequest)
        return new ResponseMap('Chấp nhận kết bạn thành công', [], 200);
    } catch (error) {
      console.error('Chấp nhận lời mời kết bạn không thành công!', error);
    }
  }

  async cancel(request_id: number, user_id: number) {
    const friendRequest = await this.findById(request_id);
    if (!friendRequest)
      return new ResponseMap('Không tìm thấy lời mời kết bạn', [], 200);
    if (friendRequest.sender.user_id !== user_id)
      return new ResponseMap('Hủy lời mời kết bạn lỗi', [], 200);
    const result = await this.friendRequestRepository.delete(request_id);
    if (result) {
      return new ResponseMap('Hủy lời mời kết bạn thành công!', [], 200);
    } else {
      return new ResponseMap('Xóa lời mời kết bạn thất bại!', [], 200);
    }
  }
  //người dùng hiện tại từ chối
  async reject(request_id: number, toUser_id: number) {
    const friendRequest = await this.findById(request_id);
    if (!friendRequest)
      return new ResponseMap('Không tìm thấy lời mời kết bạn!', [], 200);
    if (friendRequest.status === 1)
      return new ResponseMap('Hai người đã là bạn', [], 200);

    if (friendRequest.receiver.user_id !== toUser_id)
      return new ResponseMap('Lỗi lời mời kết bạn', [], 200);

    const result = this.friendRequestRepository.delete(request_id);

    if (!result) {
      return new ResponseMap('Xóa lời mời kết bạn không thành công!', [], 200);
    }
    return new ResponseMap('Từ chối lời mời kết bạn thành công', [], 200);
  }

  findById(id: number): Promise<FriendRequest> {
    return this.friendRequestRepository
      .createQueryBuilder('friend_request')
      .leftJoinAndSelect('friend_request.receiver', 'receiver')
      .leftJoinAndSelect('friend_request.sender', 'sender')
      .where('friend_request.id = :id', { id })
      .getOne();

    // return this.friendRequestRepository.findOne(id, {
    //   relations: ['receiver', 'sender'],
    // });
  }
}
