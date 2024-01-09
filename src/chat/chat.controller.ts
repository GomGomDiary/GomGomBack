import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import { MongoDBIdPipe } from 'src/common/pipes/cookieObjectId.pipe';
import { EmptyPipe } from 'src/common/pipes/empty.pipe';
import { ParseMongoIdPipe } from 'src/common/pipes/mongoIdParse.pipe';
import { Types } from 'mongoose';
import { CreateChatRoomDto } from 'src/common/dtos/request/chatRoom.post.dto';
import { ReturnValueToDto } from 'src/common/decorators/returnValueToDto';
import { ChatRoomPostDto } from 'src/common/dtos/response/chatRoom.post.dto';

@ApiTags('Chat')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ReturnValueToDto(ChatRoomPostDto)
  async createChatRoom(
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    diaryId: Types.ObjectId,
    @Body() dto: CreateChatRoomDto,
  ) {
    return await this.chatService.createChatRoom(diaryId, dto);
  }
}
