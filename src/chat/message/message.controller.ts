import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import { MongoDBIdPipe } from 'src/common/pipes/cookieObjectId.pipe';
import { EmptyPipe } from 'src/common/pipes/empty.pipe';
import { ParseMongoIdPipe } from 'src/common/pipes/mongoIdParse.pipe';
import { Types } from 'mongoose';
import { ChatMessageService } from './message.service';
import { CreateChatMessageDto } from 'src/common/dtos/request/chat.post.dto';
import { ReturnValueToDto } from 'src/common/decorators/returnValueToDto';
import { CreateMessageDto } from 'src/common/dtos/response/chatMessage.post.dto';

@ApiTags('Message')
@Controller({ path: 'chat/message', version: '1' })
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Post()
  @ReturnValueToDto(CreateMessageDto)
  async createChatMessage(
    @Body() chat: CreateChatMessageDto,
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    clientId: Types.ObjectId,
  ) {
    return await this.chatMessageService.createMessage(clientId, chat);
  }
}
