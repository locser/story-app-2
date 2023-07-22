import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { getDistance } from 'geolib';
import { Oauth } from 'src/oauth/entities/oauth.entity';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import UsersSearchService from './userSearchService.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Oauth)
    private oauthRepository: Repository<Oauth>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userSearchService: UsersSearchService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findNearMe(
    radius: number,
    user_id: number,
    numberUserNearMe: number,
  ): Promise<any> {
    // User 1: lat = 10.12345, lng = 20.54321
    // User 2: lat = 10.12350, lng = 20.54325
    // User 3: lat = 50.67890, lng = 30.98765
    // Radius: 100 (đơn vị: km)

    const LIMIT_USER = 20;

    const currentUser = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    console.log('Bay tới server và get user Near Me');

    // console.log(currentUser);

    if (!currentUser) {
      throw new Error(`User ${user_id} not found`);
    }

    //check lng lat
    if (currentUser.lat === '' || currentUser.lng === '') {
      throw new Error(`Hãy cập nhật đầy đủ vị trí của bạn để tìm kiếm dễ dàng`);
    }

    const users = await this.userRepository.find({
      take: LIMIT_USER,
      skip: 0,
    });

    let nearbyUsers: User[] = [];

    const userNearMe1 = this.getDistanceUser(
      currentUser.lat,
      currentUser.lng,
      radius,
      users,
    );
    // console.log(userNearMe1, 'userNearMe1');
    (await userNearMe1).forEach((user: User) => {
      nearbyUsers.push(user);
    });

    //or
    //let nearbyUsers: User[] = userNearMe1.map((user: User) => user);

    // console.log(nearbyUsers);

    if (nearbyUsers.length === 0) {
      //cho nó tìm thêm 10 th nữa xem có ai gần không
      const users = await this.userRepository.find({
        take: 10,
        skip: 10,
      });
      const userNearMe2 = this.getDistanceUser(
        currentUser.lat,
        currentUser.lng,
        radius,
        users,
      );
      (await userNearMe2).forEach((user: User) => {
        nearbyUsers.push(user);
      });
      // console.log(nearbyUsers);
    }

    //loại current user
    nearbyUsers = nearbyUsers.filter(
      (nearbyUser) => nearbyUser.user_id !== currentUser.user_id,
    );

    // TODO: FIX

    // await this.cacheManager.set('test', nearbyUsers,   );
    const test = await this.cacheManager.set(
      `nearByUser_${currentUser.user_id}`,
      nearbyUsers,
      { ttl: 20 },
    );
    if (!test) {
      console.log(test);
      console.log(' dữ liệu lên redis');
    }

    return nearbyUsers;
  }

  async deleteCache() {
    console.log('delete entire cacheManeger thành công');
    await this.cacheManager.reset();
  }

  async getDistanceUser(
    lat: string,
    lng: string,
    radius: number,
    users: User[],
  ) {
    const nearbyUsers = [];
    for (const user of users) {
      const distance = getDistance(
        {
          lat: parseFloat(user.lat),
          lng: parseFloat(user.lng),
        },
        {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
      );

      if (distance <= radius) {
        nearbyUsers.push(user);
      }
    }

    // console.log(nearbyUsers, 'getUserDistance');

    return nearbyUsers;
  }

  public async register(userDto: Record<string, any>) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    try {
      //check username exists
      const eUser = await this.userRepository.findOne({
        where: {
          username: userDto.username + '',
        },
      });

      if (eUser) {
        console.log('Người dùng đã tồn tại!');

        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      let createdUser = await this.userRepository.create({
        name: userDto.name + '',
        username: userDto.username + '',
        password: hashedPassword,
      });

      if (!createdUser) {
        throw new HttpException(
          'Đăng kí người dùng không thành công',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log('User repository create user');

      createdUser = await this.userRepository.save(createdUser);
      //delete password before response
      createdUser.password = undefined;

      //create index search user

      const result = await this.userSearchService.indexUser(createdUser);
      if (result) {
        console.log(result + '/n IndexUser thành công');
      }

      return createdUser;
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(createUserDto: Record<string, any>) {
    const username = createUserDto.username;
    const password = createUserDto.password;
    const user = await this.userRepository.findOne({
      where: { username: username },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng này không tồn tại!');
    }

    // const isPasswordMatched = await bcrypt.compare(password, user?.password);

    // const hashpassword = await bcrypt.hash(password, 10);
    // console.log(hashpassword, password, user.password);
    // if (user?.password !== hashpassword) {
    if (!(await bcrypt.compare(password, user?.password))) {
      throw new UnauthorizedException('Đăng nhập thất bại');
    }

    const payload = { user_id: user.user_id, username: user.username };
    const token = await this.jwtService.signAsync(payload);

    let oauth1 = await this.oauthRepository.findOne({
      where: { user_id: user.user_id },
    });

    if (!oauth1) {
      oauth1 = this.oauthRepository.create({
        user_id: user.user_id,
        access_token: token,
      });
    }

    const nOauth = this.oauthRepository.save(oauth1);
    console.log(nOauth);
    return {
      user_id: user.user_id,
      token: token,
      username: user.username,
    };
  }

  findByUsername(username: string) {
    const eUser = this.userRepository.findOne({
      where: { username: username },
    });
    console.log('sử dụng findByUsername');
    return eUser;
  }
  async create(createUserDto: CreateUserDto) {
    const newUser = await this.userRepository.create({
      ...createUserDto,
    });
    if (!newUser) {
      throw new Error('Đăng kí không thành công!');
    }
    //đăng kí thành công ->  generate token to oauth

    //generate token to save to oauth
    const payload = {
      user_id: newUser.user_id,
      username: newUser.username,
    };

    const nUser = await this.userRepository.save(newUser);
    return nUser;
  }

  async searchForUserElasticsearch(
    text: string,
    user_id: number,
  ): Promise<any> {
    const results = await this.userSearchService.search(text);
    console.log(results);

    if (results === undefined || results.length === 0) {
      return [];
    }
    const ids = results.filter(
      (result) => result.user_id + '' !== user_id + '',
    );
    return ids;
  }

  async sendFriendRequest(toUser_id: number, user_id: number) {
    const user = await this.userRepository.findOne({
      where: { user_id: toUser_id },
    });

    // if(!)
  }

  //search user elas

  //findByUsername
  // const token = await this.jwtService.signAsync(payload);

  // const oauth = this.oauthService.create({
  //   user_id: newUser.user_id,
  //   access_token: token,
  // });

  // if (oauth) {
  //   console.log('save oauth token thanh cong!');
  // }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
