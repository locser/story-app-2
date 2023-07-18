import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const user_id = req.user.user_id;
    return this.messageService.create(createMessageDto, +user_id);
  }

  @Get(':conversation_id')
  findAll(
    @Param('conversation_id') conversation_id: number,
    @Request() req,
    @Body() body,
  ) {
    const { limit = 10, skip = 0 } = body;
    const user_id = req.user.user_id;
    return this.messageService.findAll(conversation_id, limit, skip, +user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
