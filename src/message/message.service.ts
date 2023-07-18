import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    user_id: number,
  ): Promise<Message> {
    //check conversation valid
    const newConversation = await this.conversationRepository.findOne({
      where: { conversation_id: createMessageDto.conversation_id },
    });
    if (!newConversation) {
      console.log('Cuộc trò chuyện này không tìm thấy');
      throw new Error('Cuộc trò chuyện này không tìm thấy');
    }
    //check conver member include current user
    if (!newConversation.members.includes(+user_id)) {
      console.log('Không có quyền truy cập cuộc trò chuyện này!');
      throw new BadRequestException(
        'Không có quyền truy cập cuộc trò chuyện này!',
      );
    }

    const newMessage = this.messageRepository.create({
      ...createMessageDto,
      user_id: user_id,
    });

    if (!newMessage) {
      console.log('Gửi tin nhắn không thành công');

      throw new Error('Gửi tin nhắn không thành công');
    }
    return await this.messageRepository.save(newMessage);
  }

  //get all message from conversation
  async findAll(
    conversation_id: number,
    limit: number,
    skip: number,
    user_id: number,
  ): Promise<Message[]> {
    const conver = await this.conversationRepository.findOne({
      where: {
        conversation_id: conversation_id,
      },
    });

    console.log(conver);

    if (!conver) {
      throw new Error('Không tìm thấy cuộc trò chuyện này!');
    }

    if (!conver.members.includes(+user_id)) {
      throw new Error('Bạn không có quyền truy cập cuộc trò chuyện này!');
    }

    // if (conver.message.length === 0) {
    //   throw new Error('Cuộc trò truyện này chưa có tin nhắn!');
    // }

    const message = await this.messageRepository.find({
      // where: {
      //   members: Raw((alias) => `${alias} @> ARRAY['${user_id}']`),
      // },
      // skip: position, //position :  number
      // take: limit, //limit: number
      where: { conversation_id: conversation_id },
      skip: skip, //position :  number
      take: limit, //limit: number,
      order: { timestamp: 'DESC' },
    });

    return message;
  }

  async findOne(id: number) {
    const message = await this.messageRepository.findOne({
      where: { message_id: id },
    });
    if (!message) {
      throw new NotFoundException('Tin nhắn này không còn!');
    }
    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    await this.messageRepository.update(id, updateMessageDto);
    return this.messageRepository.findOne({ where: { message_id: id } });
  }

  async remove(id: number) {
    const message = await this.messageRepository.findOne({
      where: { message_id: id },
    });
    if (!message) {
      throw new Error(`Cuộc trò chuyện này chưa được khởi tạo!`);
    }
    return await this.messageRepository.delete(id);
  }
}
