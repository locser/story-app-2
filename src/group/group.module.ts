import { Module } from '@nestjs/common';
import { GroupService } from './services/group.service';
import { GroupController } from './controllers/group.controller';
import { Group } from './entities/group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessage } from './entities/groupMessage.entity';
import { UserModule } from './../user/user.module';
@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [TypeOrmModule.forFeature([Group, GroupMessage]), UserModule],
})
export class GroupModule {}
