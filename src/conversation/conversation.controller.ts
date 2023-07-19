import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(
    @Body()
    conversationDto: CreateConversationDto,
    @Request() req,
  ) {
    // console.log(req.user);
    const user_id = req.user.user_id;
    // name: string;
    // avatar: string;
    // members: number[];
    // background: string;
    // last_activity: number;
    // status: number;
    return this.conversationService.createConversation(
      conversationDto,
      +user_id,
    );
  }

  // @Get()
  // findAll() {
  //   return this.conversationService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }

  @Get('allMessage/:conversation_id')
  getMessageInConversation(
    @Param('conversation_id') conversation_id: number,
    @Request() req,
    @Body() body,
  ) {
    const user_id = req.user.user_id;
    const { limits = 2, skip = 0 } = body;

    return this.conversationService.getMessageInConversation(
      +user_id,
      limits,
      skip,
      conversation_id,
    );
  }

  //getUserConversation
  @Get('')
  getUserConversation(@Request() req) {
    const user_id = req.user.user_id;

    return this.conversationService.getUserConversation(+user_id);
  }
}
