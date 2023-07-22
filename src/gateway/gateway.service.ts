import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GatewayDB } from './entity/gatewayDB.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@UseGuards(AuthGuard)
@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(GatewayDB)
    private conversationRepository: Repository<GatewayDB>,
  ) {}
}
