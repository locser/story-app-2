import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { config } from 'dotenv';

config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  public async getUserFromAuthenticationToken(token: string): Promise<User> {
    const payload = await this.jwtService.verify(token, {
      secret: process.env.TOKEN_SECRET,
    });

    // console.log(payload);

    const user_id = payload.user_id;
    // console.log(user_id);

    const user = await this.userRepository.findOne({
      where: { user_id },
    });

    // console.log(user);

    if (!user) {
      return null;
    }

    return user;
  }
}
