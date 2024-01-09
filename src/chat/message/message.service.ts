import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateChatMessageDto } from 'src/common/dtos/request/chat.post.dto';
import { ChatMessageRepository } from 'src/common/repositories/message.repository';

@Injectable()
export class ChatMessageService {
  constructor(private readonly chatMessageRepository: ChatMessageRepository) {}

  async createMessage(clientId: Types.ObjectId, data: CreateChatMessageDto) {
    return await this.chatMessageRepository.create({
      clientId,
      ...data,
    });
  }

  async paginateMessage() {
    return 'paginate message';
  }
}
