import { Injectable, Post } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { In, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createFriendRequestDto: CreateFriendRequestDto,
    currentUser_id: number,
  ) {
    const { user_id, toUser_id } = createFriendRequestDto;

    if (user_id !== currentUser_id) {
      throw new Error(`Bạn không thể gửi lời mời thay người khác!`);
    }
    if (user_id === toUser_id) {
      return 'Không thể tự kết bạn với bản thân!';
    }

    console.log(
      '🚀 ~ file: friend-request.service.ts:24 ~ FriendRequestService ~ user_id, toUser_id:',
      user_id,
      toUser_id,
    );

    const user1 = await this.userRepository.findOne({
      where: { user_id: user_id },
    });

    const user2 = await this.userRepository.findOne({
      where: { user_id: toUser_id },
    });

    if (!user1 || !user2) {
      return 'Không tìm thấy người dùng này!';
    }

    if (user1.friends.includes(toUser_id)) {
      return 'Hai người đã là bạn!';
    }

    // const friendRequest = await this.friendRequestRepository
    //   .createQueryBuilder('friendRequest')
    //   .where('friendRequest.user_id = :toUserId', {
    //     toUserId: user_id,
    //   })
    //   .andWhere('friendRequest.to_user_id = :userId', {
    //     userId: toUser_id,
    //   })
    //   .getOne();
    const friendRequest = await this.friendRequestRepository.findOne({
      where: [
        { user_id: user_id, toUser_id: toUser_id },
        { user_id: toUser_id, toUser_id: user_id },
      ],
    });

    if (friendRequest) {
      throw new Error('Lời mời kết bạn đã được gửi trước đó!');
    } else {
      const newRequestFriendDto = this.friendRequestRepository.create({
        user_id: user1.user_id,
        toUser_id: user2.user_id,
      });

      const newRequestFriend =
        this.friendRequestRepository.save(newRequestFriendDto);

      if (!newRequestFriend) {
        throw new Error(`Gửi lời mời kết bạn thất bại!`);
      }

      return {
        message: 'Gửi lời mời kết bạn thành công!',
        data: newRequestFriend,
        status: 201,
      };
    }
  }

  async getFriendRequests(user_id: number): Promise<any> {
    const requestFriends = await this.friendRequestRepository.find({
      where: { toUser_id: user_id },
    });

    const user_ids = requestFriends.map(
      (requestFriend) => requestFriend.user_id,
    );

    const users = await this.userRepository.find({
      where: { user_id: In(user_ids) },
    });
    if (users.length > 0) {
      return {
        message: 'Lấy dữ lieejut hành công',
        data: [users],
        status: 200,
      };
    }

    return {
      message: 'Chưa có lời mời kết bạn nào!',
      data: [],
      status: 200,
    };

    // const users: User[] = [];
    // requestFriends.map(async (requestFriend) => {
    //   const user = await this.userRepository.findOne({
    //     where: { user_id: requestFriend.user_id },
    //   });

    //   if (user) {
    //     users.push(user);

    //   }
    // });

    // return users;
  }

  async accept(request_id: number, user_id: number): Promise<any> {
    const friendRequest = await this.friendRequestRepository.findOne({
      where: {
        request_id: request_id,
      },
    });

    if (!friendRequest) throw new Error('Không tìm thấy lời mời kết bạn!');

    const toUser_id = +friendRequest.toUser_id;
    const sender_id = +friendRequest.user_id;
    console.log(
      '🚀 ~ file: friend-request.service.ts:143 ~ FriendRequestService ~ accept ~ friendRequest.toUser_id !== user_id:',
      toUser_id,
      user_id,
    );
    if (toUser_id !== user_id)
      throw new Error('Bạn không có quyền chấp nhận lời mời kết bạn này!');

    const currentUser = await this.userRepository.findOne({
      where: { user_id: user_id },
    });

    const sender = await this.userRepository.findOne({
      where: { user_id: sender_id },
    });

    //add user to friend list
    sender.friends.push(user_id);
    currentUser.friends.push(sender_id);

    //update user and friend list
    //upadate many
    try {
      await this.userRepository.save([sender, currentUser]);
      console.log(
        '🚀 ~ file: friend-request.service.ts:168 ~ FriendRequestService ~ accept ~ sender, currentUser:',
        sender,
        currentUser,
      );
      console.log('Chấp nhận lời mời kết bạn thành công');
      await this.friendRequestRepository.delete(friendRequest.request_id);
    } catch (error) {
      console.error('Chấp nhận lời mời kết bạn không thành công!', error);
    }

    return { message: 'Chấp nhận kết bạn thành công!', data: [], status: 200 };
  }

  async cancel(request_id: number, user_id: number) {
    const friendRequest = await this.friendRequestRepository.findOne({
      where: { request_id: request_id },
    });
    if (!friendRequest)
      return {
        message: 'Không tìm thấy lời mời kết bạn',
        data: [],
        status: 'success',
      };
    if (friendRequest.user_id !== user_id)
      return {
        message: 'Lời mời kết bạn lỗi',
        data: [],
        status: 'success',
      };
    await this.friendRequestRepository.delete(request_id);
    return {
      message: 'Hủy lời mời kết bạn thành công!',
      data: [],
      status: 'success',
    };
  }
  //người dùng hiện tại từ chối
  async reject(request_id: number, toUser_id: number) {
    const friendRequest = await this.friendRequestRepository.findOne({
      where: { request_id: request_id },
    });
    if (!friendRequest) throw new Error('Không tìm thấy lời mời kết bạn!');
    if (friendRequest.toUser_id !== toUser_id)
      throw new Error('Lời mời kết bạn lỗi!');

    this.friendRequestRepository.delete(friendRequest);

    return {
      message: 'Từ chối lời mời kết bạn thành công',
      data: [],
      status: 'success',
    };
  }
}
