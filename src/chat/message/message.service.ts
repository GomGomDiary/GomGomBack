import { ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateChatMessageDto } from 'src/common/dtos/request/chat.post.dto';
import { PaginateMessageDto } from 'src/common/dtos/request/message.get.dto';
import { ChatRepository } from 'src/chat/chat.repository';
import { ChatMessageRepository } from 'src/chat/message/message.repository';
import { Chat } from 'src/models/chat.schema';
import { generatePaginationQuery } from 'src/utils/pagination';

@Injectable()
export class ChatMessageService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  async createMessage(
    clientId: Types.ObjectId,
    chatMessageDto: CreateChatMessageDto,
  ) {
    const chatRoom = await this.chatRepository.findChatRoom(
      clientId,
      chatMessageDto.roomId,
    );
    if (!chatRoom) {
      throw new ForbiddenException('채팅방을 찾을 수 없습니다.');
    }
    return await this.chatMessageRepository.create({
      clientId,
      ...chatMessageDto,
    });
  }

  async paginateMessage(
    clientId: Types.ObjectId,
    roomId: Types.ObjectId,
    paginateMessageDto: PaginateMessageDto,
  ) {
    const chatRoom = await this.chatRepository.findChatRoom(clientId, roomId);
    if (!chatRoom) {
      throw new ForbiddenException('채팅방을 찾을 수 없습니다.');
    }

    const query = generatePaginationQuery(
      { roomId },
      1,
      paginateMessageDto.next,
    );
    const messageList = await this.chatMessageRepository.paginate(
      query.paginatedQuery,
      paginateMessageDto.take,
      clientId,
    );

    const result = {
      messageList,
      next: messageList[0]?._id,
    };
    return result;
  }
}
