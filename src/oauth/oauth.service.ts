import { Injectable } from '@nestjs/common';
import { CreateOauthDto } from './dto/create-oauth.dto';
import { Oauth } from './entities/oauth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OauthService {
  constructor(
    @InjectRepository(Oauth)
    private oauthRepository: Repository<Oauth>,
  ) {}

  create(createOauthDto: CreateOauthDto) {
    const oauth = this.oauthRepository.create(createOauthDto);
    return this.oauthRepository.save(oauth);
  }

  // findAll() {
  //   return `This action returns all oauth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} oauth`;
  // }

  // update(id: number, updateOauthDto: UpdateOauthDto) {
  //   return `This action updates a #${id} oauth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} oauth`;
  // }
}
