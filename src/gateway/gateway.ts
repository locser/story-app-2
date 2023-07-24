import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { IGatewaySessionManager, UserSocket } from './gateway.session';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { CreateMessageResponse } from 'src/utils/types';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { Repository } from 'typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { GatewayDB } from './entity/gatewayDB.entity';
import { MessageService } from 'src/message/message.service';
import { GatewayService } from './gateway.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FriendService } from 'src/friend/friend.service';
import { UserMapResponse } from 'src/user/types/userMapResponse';

@WebSocketGateway()
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    @Inject('GATEWAY_SESSION_MANAGER')
    private readonly sessions: IGatewaySessionManager,
    // @InjectRepository(Message)
    // private messageRepository: Repository<Message>,
    // @InjectRepository(Conversation)
    // private conversationRepository: Repository<Conversation>,
    private conversationService: ConversationService,
    @InjectRepository(GatewayDB)
    private getwayService: GatewayService,
    private messageService: MessageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private friendService: FriendService,
  ) {}

  // ws = new WebSocket('ws://localhost:3002');
  @WebSocketServer()
  server: Server;

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.headers.token;
    // console.log(client.handshake.headers.token);
    const currentUser = await this.authService.getUserFromAuthenticationToken(
      token.toString(),
    );

    if (!currentUser) {
      console.log(`Socket - Hãy thử đăng nhập lại!`);
      // throw new Error('Khoong tim thay User hien tai');
    } else {
      // add vào sessions các user đang hoạt động
      //add socket vào redis server
      client.user = currentUser;

      await this.sessions.setUserSocket(client);

      console.log(
        `Socket -User ${currentUser.user_id} connected with Socket: ${client.id} `,
      );
      client.user = currentUser;

      console.log(`Các room hiện tại: ${client.rooms}`);
    }
  }
  async handleDisconnect(client: AuthenticatedSocket) {
    const token = client.handshake.headers.token;
    const currentUser = await this.authService.getUserFromAuthenticationToken(
      token.toString(),
    );

    console.log(
      `Socket -User ${currentUser.user_id}) with  ${client.id} disconnected`,
    );
    client.user = undefined;
    this.sessions.removeUserSocket(currentUser.user_id);
  }

  async checkConversationAndAccess(conversation_id: number, user_id: number) {
    const conversation = await this.conversationService.findOne(
      +conversation_id,
    );
    if (!conversation) {
      console.log(`Could not find conversation`);
    }
    const checkAccess = this.conversationService.hasAccess(
      conversation.members,
      +user_id,
    );
    if (checkAccess === false) {
      console.log(conversation.members);
      console.log(`Bạn không có quyền truy cập cuộc trò chuyện này!`);
    }

    return true;
  }

  @SubscribeMessage('onConversationJoin')
  async onConversationJoin(
    @MessageBody()
    body: {
      conversation_id: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const conversation_id = body.conversation_id;
    // check conversation
    if (
      (await this.checkConversationAndAccess(
        conversation_id,
        client.user.user_id,
      )) === true
    ) {
      console.log(
        `User with id '${client.user.user_id}' joined a Conversation of ID: ${body.conversation_id}`,
      );
      // 1 socket chỉ vô 1 room
      //xóa all room client đó tham gia
      client = this.leaveAllRooms(client);

      client.join(`conversation-${body.conversation_id}`); // thêm socket của client vào một phòng
      this.sessions.setUserSocket(client);
      console.log(client.rooms); //Đây là thuộc tính của socket và chứa danh sách các phòng mà socket hiện đang tham gia.
      client.to(`conversation-${conversation_id}`).emit(`userJoin`);
      //gửi một sự kiện có tên là 'userJoin' tới tất cả các socket trong phòng có tên là 'conversation-{conversationId}', trừ chính socket của client hiện đang xử lý sự kiện.
    } else {
      console.log('Có lỗi xảy ra!');
    }
  }

  leaveAllRooms(@ConnectedSocket() client: AuthenticatedSocket) {
    const currentRooms = Array.from(client.rooms).filter(
      (room) => room !== client.id,
    );

    // Rời khỏi các room hiện tại
    currentRooms.forEach((room) => {
      client.leave(room);
    });

    return client;
  }

  @SubscribeMessage('onConversationLeave')
  async onConversationLeave(
    @MessageBody()
    data: {
      conversation_id: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (
      (await this.checkConversationAndAccess(
        +data.conversation_id,
        client.user.user_id,
      )) === true
    ) {
      console.log(
        `User with id '${client.user?.user_id}' Leave conversation of ID: '${data.conversation_id}'`,
      );
      client.leave(`${data.conversation_id}`); //remove socket của user hiện tại ra khỏi phòng
      console.log(client.rooms);
      client.to(`${data.conversation_id}`).emit('userLeave');
    } else {
      console.log(`Có lỗi xảy ra!`);
    }
  }

  @SubscribeMessage('onTypingStart')
  async onTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (
      (await this.checkConversationAndAccess(
        +data.conversation_id,
        client.user.user_id,
      )) === true
    ) {
      console.log(`Người dùng ${client.user.name} đang nhập'`);
      console.log(data.conversation_id);
      console.log(client.rooms);
      // client.to(`${data.conversation_id}`).emit('onTypingStart');
      this.server
        .to(`conversation-${data.conversation_id}`)
        .emit('onTypingStart', `Người dùng ${client.user.name} đang nhập'`);
    } else {
      throw new Error(`Có lỗi xảy ra`);
    }
  }

  @SubscribeMessage('onTypingStop')
  async onTypingStop(
    @MessageBody()
    data: {
      conversation_id: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (
      (await this.checkConversationAndAccess(
        +data.conversation_id,
        client.user.user_id,
      )) === true
    ) {
      console.log('onTypingStop');
      console.log(data.conversation_id);
      console.log(client.rooms);
      // client.to(`${data.conversation_id}`).emit('onTypingStop');
      this.server
        .to(`conversation-${data.conversation_id}`)
        .emit('onTypingStop', `Người dùng ${client.user.name} dừng nhập'`);
    }
  }

  @OnEvent('message.create') // là một decorator được sử dụng để đăng ký một event handler (bộ xử lý sự kiện) cho một sự kiện cụ thể trong ứng dụng.
  async handleMessageCreateEvent(payload: CreateMessageResponse) {
    console.log('Inside message.create');

    const { message, conversation } = payload;

    // const userSocket = await this.sessions.getUserSocket(message.user_id); // người gửi

    this.server
      .to(`conversation-${conversation.conversation_id}`)
      .emit(
        'onMessage',
        `Nguời dùng ${message.user_id} gửi tin nhắn với nội dung: '${message.message}' tới cuộc trò chuyện ${conversation.name}`,
      );
    //bắn cho user ngoài room.
    const memberIds: number[] = this.filterUserInConversation(
      message.user_id,
      conversation.members,
    );

    const socketMembers: UserSocket[] = [];
    for (let i = 0; i < memberIds.length; i++) {
      const redisSocket: UserSocket = await this.sessions.getUserSocket(
        memberIds[i],
      );

      if (redisSocket !== null) {
        if (
          redisSocket.room !== `conversation-${conversation.conversation_id}` &&
          redisSocket.room !== ''
        ) {
          socketMembers.push(redisSocket);
        }
      }
    }

    if (socketMembers.length > 0) {
      socketMembers.forEach((socketMember) => {
        this.server
          .to(socketMember.socket_id)
          .emit(
            'onMessage',
            `Nguời dùng ${message.user_id} gửi tin nhắn với nội dung: '${message.message}' tới cuộc trò chuyện ${conversation.name}`,
          );
      });
    } else {
      console.log('Không có ai online để bắn ');
    }
  }

  // Lọc ra các user socket còn lại trong socket đang online và có trong sessions
  filterUserInConversation(user_id: number, members: number[]): number[] {
    // lây thông tin người nhận = cách loại user hiện tại ra khỏi danh sách memeber trong conversation
    // check xem  nó có online không
    const recipient_ids = members.filter((member) => member !== user_id);

    return recipient_ids;
  }

  // @OnEvent('conversation.create')
  // handleConversationCreateEvent(payload: Conversation) {
  //   // name: string;
  //   // avatar: string;
  //   // members: number[]; // the last user is who created the conversation
  //   // background: string;
  //   // last_activity: number;
  //   // status: number;
  //   console.log('Inside conversation.create');
  //   const lastMember_id = payload.members[payload.members.length - 1];
  //   const recipientSockets = this.filterUserInConversation(
  //     lastMember_id,
  //     payload.members,
  //   );
  //   recipientSockets.forEach((recipientSocket) =>
  //     recipientSocket.emit('onMessage', payload),
  //   );
  // }

  //FIXME: now thêm rdis các thứi
  // khi người dùng đăng nhập, load danh sách bạn bè, sẽ gọi tới event rồi báo
  @OnEvent('friend.online')
  async handleFriendListRetrieve(payload: any) {
    const friends = payload.friends;
    const user_id = payload.user_id;
    const socketMembers: UserSocket[] = [];
    const friendOnlines: UserMapResponse[] = [];
    for (let i = 0; i < friends.length; i++) {
      const redisSocket: UserSocket = await this.sessions.getUserSocket(
        friends[i].user_id,
      );

      if (redisSocket !== null) {
        socketMembers.push(redisSocket);
        friendOnlines.push(friends[i]);
      }
    }
    console.log(`danh sách bạn bè online của user : ${socketMembers}`);=
    this.cacheManager.set(`user-${user_id}-friends-online`, friendOnlines, {
      ttl: 0,
    });
  }

  // @SubscribeMessage('newMessage')
  // sendNewMessage(
  //   @MessageBody()
  //   body: {
  //     conversation_id: number;
  //     type: number;
  //     message: string;
  //     status: number;
  //   },
  // ) {
  //   console.log(body);

  //   this.server.sockets.emit('sendNewMessage', {
  //     msg: 'New message',
  //     content: body,
  //   });
  //   this.server.sockets.on('sendNewMessage', () => {
  //     console.log(body);
  //   });
  //   this.server.emit('onMessage', {
  //     msg: 'New message',
  //     content: body,
  //   });
  // }

  // //conversationGroup
  // @SubscribeMessage('onGroupJoin')
  // onGroupJoin(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: AuthenticatedSocket,
  // ) {
  //   console.log('onGroupJoin');
  //   client.join(`group-${data.conversation_id}`);
  //   console.log(client.rooms);
  //   client.to(`group-${data.conversation_id}`).emit('userGroupJoin');
  // }

  // @SubscribeMessage('onGroupLeave')
  // onGroupLeave(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: AuthenticatedSocket,
  // ) {
  //   console.log('onGroupLeave');
  //   client.leave(`group-${data.conversation_id}`); //Khi socket muốn rời khỏi phòng
  //   console.log(client.rooms);
  //   client.to(`group-${data.conversation_id}`).emit('userGroupLeave');
  // }
}

//  body: {
//   conversation_id: number;
//   type: number;
//   message: string;
//   status: number;
// },
