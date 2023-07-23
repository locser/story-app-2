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
import { plainToClass } from 'class-transformer';
import { UserMapResponse } from './types/userMapResponse';
import {
  CreateIndexUserError,
  UserAlreadyExists,
  UserNotFoundException,
  UserNotUpdatePositionException,
} from './exceptions/userException';
import { ResponseMap } from 'src/utils/responseMap';

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

    try {
      const currentUser: User = await this.findByUserId(user_id);
      // console.log('Bay tới server và get user Near Me');

      if (!currentUser) {
        throw new UserNotFoundException();
      }
      //check lng lat
      if (currentUser.lat === '' || currentUser.lng === '') {
        throw new UserNotUpdatePositionException();
      }

      const users = await this.userRepository.find({
        take: LIMIT_USER,
        skip: 0,
      });

      let nearbyUsers: User[] = [];
      const userNearMe1 = await this.getDistanceUser(
        currentUser.lat,
        currentUser.lng,
        radius,
        users,
      );
      // console.log(userNearMe1, 'userNearMe1');
      nearbyUsers = [...nearbyUsers, ...userNearMe1];

      if (nearbyUsers.length === 0) {
        //cho nó tìm thêm 10 th nữa xem có ai gần không
        const users = await this.userRepository.find({
          take: 10,
          skip: 10,
        });
        const userNearMe2: User[] = await this.getDistanceUser(
          currentUser.lat,
          currentUser.lng,
          radius,
          users,
        );
        nearbyUsers = [...nearbyUsers, ...userNearMe2];
      }

      //loại current user
      nearbyUsers = nearbyUsers.filter(
        (nearbyUser) => nearbyUser.user_id !== currentUser.user_id,
      );

      const userResponses = nearbyUsers.map((user) =>
        plainToClass(UserMapResponse, user),
      );

      // await this.cacheManager.set('test', nearbyUsers,   );
      const test = await this.cacheManager.set(
        `nearByUser_${currentUser.user_id}`,
        userResponses,
        { ttl: 200 },
      );
      if (!test) {
        console.log(test);
        console.log(' dữ liệu lên redis');
      }

      return new ResponseMap(
        'Tìm kiếm người dùng xung quanh bạn!',
        userResponses,
        200,
      );
    } catch (error) {
      console.log(error);
    }
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
  ): Promise<User[]> {
    const nearbyUsers: User[] = [];
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
      const eUser = await this.findByUsername(userDto.username);

      if (eUser) {
        throw new UserAlreadyExists();
      }

      let createdUser = this.userRepository.create({
        name: userDto.name + '',
        username: userDto.username + '',
        password: hashedPassword,
      });

      createdUser = await this.userRepository.save(createdUser);

      //map properties returned
      const userResponse = plainToClass(UserMapResponse, createdUser);
      //create index search user

      const result = await this.userSearchService.indexUser(createdUser);
      if (result) {
        throw new CreateIndexUserError();
      }

      return new ResponseMap('Đăng kí thành công', userResponse, 200);
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

    if (!(await bcrypt.compare(password, user?.password))) {
      throw new UnauthorizedException(
        'Tài khoản hoặc mật khẩu không chính xác',
      );
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
    } else {
      //update access token user
      oauth1 = await this.oauthRepository.save({
        ...oauth1,
        access_token: token,
      });
    }
    // lưu token user lên redis
    this.cacheManager.set(`user-${user.user_id}`, token);

    return new ResponseMap('Đăng nhập thành công', token, 200);
  }

  async findByUsername(username: string) {
    const selections = ['avatar', 'username', 'user_id', 'name', 'gender'];
    const eUser = await this.userRepository.findOne({
      where: { username: username + '' },
    });

    const user = new UserMapResponse(eUser);

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create({
      ...createUserDto,
    });

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

  async findByUserId(user_id: number): Promise<User> {
    const selections = ['avatar', 'username', 'user_id', 'name'];
    const eUser = await this.userRepository
      .createQueryBuilder('user')
      .select(selections)
      .where('user.user_id = :user_id', { user_id })
      .andWhere('user.status = :status', { status: 0 })
      .getOne();

    return eUser;
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
