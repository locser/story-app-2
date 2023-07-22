import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //get friends by current user
  async getFriends(user_id: number): Promise<any> {
    //get current user
    const currentUser = await this.userRepository.findOneById(user_id);

    const friend_ids = currentUser.friends;

    const friends: User[] = [];

    friend_ids.forEach(async (friend_id) => {
      const friend = await this.userRepository.findOneById(friend_id);
      if (friend) {
        friends.push(friend);
      }
    });

    //TODO: add friends online to redis
    //get friends online

    return {
      messsage:
        friends.length === 0
          ? 'Bạn chưa có bạn bè, hãy kết bạn!'
          : 'Lấy danh sách bạn bè thành công!',
      data: [],
      status: 200,
    };
  }

  findFriendById(user_id: number): Promise<User> {
    return this.userRepository.findOne({ where: { user_id: user_id } });
  }

  async deleteFriend(toUser_id: number, user_id: number) {
    const friend = await this.findFriendById(toUser_id);
    if (!friend) throw new Error('Không tìm thấy người dùng này!');
    // console.log(friend);

    const index1 = friend.friends.indexOf(user_id);

    //không có trong danh sách bạn bè của người kia
    if (index1 === -1) {
      throw new Error(
        'Không phải là bạn bè của nhau, không thể thực hiện hành động',
      );
      //delete friend in friend list
    }
    friend.friends.splice(index1, 1);
    console.log(
      '🚀 ~ file: friend.service.ts:61 ~ FriendService ~ deleteFriend ~ friend.friends :',
      friend.friends,
    );

    const user = await this.findFriendById(user_id);

    const index2 = user.friends.indexOf(friend.user_id);
    user.friends.splice(index2, 1);
    console.log(
      '🚀 ~ file: friend.service.ts:66 ~ FriendService ~ deleteFriend ~ user.friends:',
      user.friends,
    );

    //update friend list database
    try {
      await this.userRepository.save([user, friend]);
      console.log('Xóa bạn thành công');
    } catch (error) {
      console.error('Xóa bạn không thành công', error);
      throw new Error('Xóa bạn không thành công');
    }

    return { message: 'xóa bạn bè thành công!', data: [], status: 'success' };
  }

  // isFriends(userOneId: number, userTwoId: number) {
  //   return this.findOne({
  //     where: [
  //       {
  //          { user_id: userOneId },
  //         { toUser_id: userTwoId },
  //       },
  //       {
  //         { user_id: userTwoId },
  //          { toUser_id: userOneId },
  //       },
  //     ],
  //   });
  // }
}
