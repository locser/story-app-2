import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { config } from 'dotenv';
import { Reflector } from '@nestjs/core';

import { SetMetadata } from '@nestjs/common';

config();
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
//For this, we can create a custom decorator using the SetMetadata decorator factory function.
//@Public() add a decorator, example:
// @Public()
// @Get()
// findAll() {
//   return [];
// }
//Lastly, we need the AuthGuard to return true when the "isPublic" metadata is found. For this, we'll use the Reflector class (read more here)

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  //xác thực quyền
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Dang nhap de su dung!');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.TOKEN_SECRET,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
      console.log(JSON.stringify(request.user));
    } catch {
      throw new UnauthorizedException('Phien dang nhap da het han!');
    }

    return true; // và chuyển qua các middleware khác và tiếp tục
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
