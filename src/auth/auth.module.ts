import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [AuthService],
  exports: [AuthService],
  imports: [TypeOrmModule.forFeature([User]), UserModule],
})
export class AuthModule {}
