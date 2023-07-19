import {
  Body,
  Injectable,
  NotFoundException,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Raw, Repository } from 'typeorm';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/entities/user.entity';
import { In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@UseGuards(AuthGuard)
@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // getMessageInConversation(+user_id, limits, skip, conversation_id);
  async getMessageInConversation(
    user_id: number,
    limits: number,
    skip: number,
    conversation_id: number,
  ): Promise<any> {
    // 1
    const conver = await this.conversationRepository.findOne({
      relations: ['message'],
      where: { conversation_id },
    });

    // 2
    console.log(limits);

    if (!conver) {
      throw new Error('Không tìm thấy cuộc trò chuyện này!');
    }

    if (!conver.members.includes(+user_id)) {
      throw new Error('Bạn không có quyền truy cập cuộc trò chuyện này!');
    }

    if (conver.message.length === 0) {
      throw new Error('Cuộc trò truyện này chưa có tin nhắn!');
    }
    return conver;
  }

  async createConversation(
    conversationDto: CreateConversationDto,
    user_id: number,
  ): Promise<any> {
    // console.log(user_id + ' conversation');

    //check size of members 1 - chat 1-1, size > 1 is group
    if (conversationDto.members.length < 1) {
      throw new Error('Cuộc trò chuyện cần ít nhất 2 người!');
    }
    //get user in members list and check user exists
    const invalidIds = await this.checkInvalidMembers(conversationDto.members);
    if (invalidIds.length > 0) {
      console.log('Các id không tương ứng:', invalidIds);
      // Xử lý khi có id không tương ứng
      throw new Error(`Id người dùng không hợp lệ ${invalidIds}`);
    }

    //xử lý id hợp lệ
    //thêm người tạo vào member
    // FIXME: trường hợp nhắn cho chính mình
    // const updateMembers = conversationDto.members.push(user_id);
    const updateMembers = [...conversationDto.members, user_id];
    console.log('member: ', updateMembers);

    // check consversation đã tồn tại chưa
    // (1) rồi thì báo và trả về cái conversation đã tạo
    // (2) chưa thì tạo cái mới

    // let newConversation = this.conversationRepository.findOne({
    //   where: { members: updateMembers },
    // });

    // Tạo câu truy vấn tùy chỉnh
    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.members = :members', { members: updateMembers })
      .getOne();

    const newConversation = await query;

    console.log('newCOnversation: ' + newConversation);

    let result = '';
    if (newConversation) {
      // (1)
      result = 'Cuộc trò chuyện này đã được tạo, chuyển hướng tới nó!';
      console.log(result);
      return {
        conversation: newConversation,
        result: result,
      };
    }
    // (2)
    // const conversation = this.conversationRepository.save(newConversation);
    const conversation = await this.conversationRepository.create({
      ...conversationDto,
      members: updateMembers,
    });

    console.log(conversation);

    const newConver = await this.conversationRepository.save(conversation);
    console.log(newConver);

    if (!newConver) {
      throw new Error(`Không thể tạo conversation thành công!`);
    }
    result = 'Tạo cuộc trò chuyện mới thành công, chuyển hướng tới nó!';

    return {
      conversation: newConver,
      result: result,
    };
  }

  async checkInvalidMembers(members: number[]): Promise<number[]> {
    try {
      // const users = await this.userRepository.findByIds(members);
      // Finds entities with ids. Optionally find options or conditions can be applied.
      // @deprecated
      // use findBy method instead in conjunction with In operator, for example:
      // .findBy({ id: In([1, 2, 3]) })
      // import { In } from 'typeorm';
      const users = await this.userRepository.findBy({ user_id: In(members) });
      // map ids
      const existingIds = users.map((user) => +user.user_id);

      const invalidIds = members.filter(
        (member_id) => !existingIds.includes(member_id),
      );

      return invalidIds;
    } catch (error) {
      console.log(error);

      throw new Error('Có người dùng không hợp lệ!');
    }
  }

  async create(createConversationDto: CreateConversationDto) {
    const newConversation = await this.conversationRepository.create(
      createConversationDto,
    );

    return this.conversationRepository.save(newConversation);
  }

  //admin find
  async findAll(): // user_id: string,
  // position: number,
  // limit: number,
  Promise<Conversation[]> {
    const convers = await this.conversationRepository.find({
      // where: {
      //   members: Raw((alias) => `${alias} @> ARRAY['${user_id}']`),
      // },
      // skip: position, //position :  number
      // take: limit, //limit: number
    });
    return convers;
  }

  // //user find
  // async findAllByUser(): // user_id: string,
  // // position: number,
  // // limit: number,
  // Promise<Conversation[]> {
  //   const convers = await this.conversationRepository.find({
  //     where: {
  //       members: Raw((alias) => `${alias} @> ARRAY['${user_id}']`),
  //     },
  //     // skip: position, //position :  number
  //     // take: limit, //limit: number
  //   });
  //   return convers;
  // }

  async getUserConversation(user_id: number): Promise<any> {
    // const convers = await this.conversationRepository.find({
    // where: {
    //   members: Raw((alias) => `${alias} @> ARRAY['${user_id}']`),
    //   // members: Raw((alias) => `${alias} @> ARRAY['${user_id}']`),
    // },
    // biểu thức Raw để so sánh members của conversation với một mảng chứa user_id
    // Raw không được hỗ trợ cho mảng members kiểu number[] trong TypeORM.
    // skip: position, //position :  number
    // take: limit, //limit: number

    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation') //createQueryBuilder để tạo một câu truy vấn tùy chỉnh
      .where(`:user_id = ANY(conversation.members)`, { user_id: user_id }) //sử dụng mệnh đề where và mệnh đề ANY, chúng ta so sánh user_id với mỗi phần tử trong mảng members
      .getMany(); //getMany để lấy danh sách các conversation tìm thấy.

    if (conversations.length < 1) {
      //không có cuộc trò chuyện
      const data = {
        message: 'Không có cuộc trò chuyện nào',
        data: conversations,
        status: 'xxx',
      };

      return data;
    }

    const data = {
      message: `${user_id} lấy các cuộc trò chuyện thành công`,
      data: conversations,
      status: 'xxx',
    };

    const test = await this.cacheManager.set(
      `getConversation_${user_id}`,
      data,
      { ttl: 25 },
    );
    if (!test) {
      console.log(test);
      console.log(' dữ liệu lên redis');
    }

    return data;

    // return 'API for user get all conversation';
  }

  //admin find
  async findOne(id: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { conversation_id: id },
    });
    if (!conversation) {
      throw new NotFoundException('Cuộc trò chuyện này chưa được khởi tạo!');
    }
    // console.log();

    // if (.status === 1 || .user !== user_id) {
    //   throw new Error(' was deleted or detected fail!');
    // }
    return conversation;
  }

  //admin find
  async findOneByUser(id: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { conversation_id: id },
    });
    if (!conversation) {
      throw new NotFoundException('Cuộc trò chuyện này chưa được khởi tạo!');
    }
    // console.log();

    // if (.status === 1 || .user !== user_id) {
    //   throw new Error(' was deleted or detected fail!');
    // }
    return conversation;
  }

  async update(id: number, updateConversationDto: UpdateConversationDto) {
    await this.conversationRepository.update(id, updateConversationDto);
    return this.conversationRepository.findOne({
      where: { conversation_id: id },
    });
  }

  async remove(id: number) {
    //check if the conversation exists
    const conversation = await this.conversationRepository.findOne({
      where: { conversation_id: id },
    });
    if (!conversation) {
      throw new Error(`Cuộc trò chuyện này chưa được khởi tạo!`);
    }
    return await this.conversationRepository.delete(id);
  }
}
