import { Socket } from 'socket.io';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Message } from 'src/message/entities/message.entity';

export type CreateMessageResponse = {
  message: Message;
  conversation: Conversation;
};
