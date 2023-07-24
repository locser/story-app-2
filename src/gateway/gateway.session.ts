import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AuthenticatedSocket } from 'src/utils/interfaces';
import { GatewayDB } from './entity/gatewayDB.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface IGatewaySessionManager {
  getUserSocket(id: number);
  setUserSocket(socket: AuthenticatedSocket): void;
  removeUserSocket(id: number): void;
  getSockets();
  setOnlineFriends(user_id: number, onlineFriends: number[]);
}

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  constructor(
    @InjectRepository(GatewayDB)
    private gatewayRepository: Repository<GatewayDB>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserSocket(user_id: number): Promise<UserSocket> {
    const socket: any = await this.cacheManager.get(`user-${user_id}`);

    console.log(
      '🚀 ~ file: gateway.session.ts:29 ~ GatewaySessionManager ~ getUserSocket ~ socket:',
      socket,
    );
    const redisSocket: UserSocket = {
      socket_id: socket?.socket_id || '',
      room: socket?.room || '',
    };
    return redisSocket;
  }

  async setUserSocket(socket: AuthenticatedSocket): Promise<any> {
    //save to database

    const result = await this.gatewayRepository.save({
      user_id: socket.user.user_id,
      socket_id: socket.id,
    });

    const redisSocket: UserSocket = {
      socket_id: socket.id,
      room: Array.from(socket.rooms)[1] || 'no',
    };

    await this.cacheManager.set(`user-${result.user_id}`, redisSocket, {
      ttl: 0,
    });
  }
  removeUserSocket(userId: number) {
    // this.sessions.delete(userId);
    this.cacheManager.del(`user-${userId}`);
    this.gatewayRepository.delete({ user_id: userId });
  }
  async getSockets() {
    // const allKeys = await this.cacheManager.keys('user*');
    return 'getSocket';
  }

  setOnlineFriends(user_id: number, onlineFriends: number[]) {
    this.cacheManager.set(`user-${user_id}-onlineFriends`, onlineFriends, {
      ttl: 0,
    });
  }
}

export class UserSocket {
  socket_id: string;
  room: string;
}

// const test = await this.cacheManager.set(
//   `getConversation_${user_id}`,
//   data,
//   { ttl: 25 },
// );
// if (!test) {
//   console.log(test);
//   console.log(' dữ liệu lên redis');
// }
