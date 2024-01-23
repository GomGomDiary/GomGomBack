import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import { MongoDBIdPipe } from 'src/common/pipes/cookieObjectId.pipe';
import { EmptyPipe } from 'src/common/pipes/empty.pipe';
import { ParseMongoIdPipe } from 'src/common/pipes/mongoIdParse.pipe';
import { Types } from 'mongoose';
import { ChatMessageService } from './message.service';
import { CreateChatMessageDto } from 'src/common/dtos/request/chat.post.dto';
import { ReturnValueToDto } from 'src/common/decorators/returnValueToDto';
import { CreateMessageDto } from 'src/common/dtos/response/chatMessage.post.dto';
import { PaginateMessageDto } from 'src/common/dtos/request/message.get.dto';
import { MessageGetListDto } from 'src/common/dtos/response/message.get.dto';

@ApiTags('Chat/Message')
@Controller({ path: 'chat/message', version: '1' })
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}
  // @ApiOperation({ summary: '채팅 메시지 생성' })
  // @ApiResponse({
  //   status: 201,
  //   type: CreateMessageDto,
  // })
  // @ApiBody({
  //   type: CreateChatMessageDto,
  // })
  // @Post()
  // @ReturnValueToDto(CreateMessageDto)
  // async createChatMessage(
  //   @Body() chat: CreateChatMessageDto,
  //   @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
  //   clientId: Types.ObjectId,
  // ) {
  //   return await this.chatMessageService.createMessage(clientId, chat);
  // }

  @ApiOperation({ summary: '채팅방 메세지 불러오기' })
  @ApiResponse({
    status: 200,
    type: MessageGetListDto,
  })
  @ApiParam({
    name: 'roomId',
  })
  @ApiQuery({
    name: 'query',
    type: PaginateMessageDto,
  })
  @Get('/:roomId')
  @ReturnValueToDto(MessageGetListDto)
  async paginateMessage(
    @Param('roomId', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    roomId: Types.ObjectId,
    @Query() query: PaginateMessageDto,
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    clientId: Types.ObjectId,
  ) {
    return this.chatMessageService.paginateMessage(clientId, roomId, query);
  }
}
