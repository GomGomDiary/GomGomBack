import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import { MongoDBIdPipe } from 'src/common/pipes/cookieObjectId.pipe';
import { EmptyPipe } from 'src/common/pipes/empty.pipe';
import { ParseMongoIdPipe } from 'src/common/pipes/mongoIdParse.pipe';
import { Types } from 'mongoose';
import { CreateChatRoomDto } from 'src/common/dtos/request/chatRoom.post.dto';
import { ReturnValueToDto } from 'src/common/decorators/returnValueToDto';
import { ChatRoomPostDto } from 'src/common/dtos/response/chatRoom.post.dto';
import { ChatTokenShowDto } from 'src/common/dtos/response/chat.token.res.dto';

@ApiTags('Chat')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({
    summary: '채팅방 생성',
    description: '웹소켓 연결 전, 채팅방 생성이 먼저 이루어져야 합니다.',
  })
  @ApiResponse({
    status: 201,
    type: ChatRoomPostDto,
  })
  @ApiBody({
    type: CreateChatRoomDto,
  })
  @Post()
  @ReturnValueToDto(ChatRoomPostDto)
  async createChatRoom(
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    diaryId: Types.ObjectId,
    @Body() dto: CreateChatRoomDto,
  ) {
    return await this.chatService.createChatRoom(diaryId, dto);
  }

  @ApiOperation({
    summary: '채팅 토큰 생성',
    description: '웹소켓 연결에 필요한 채팅 토큰을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    type: ChatTokenShowDto,
  })
  @Post('token')
  @ReturnValueToDto(ChatTokenShowDto)
  async createToken(
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    diaryId: Types.ObjectId,
  ) {
    return await this.chatService.createToken(diaryId);
  }
}
