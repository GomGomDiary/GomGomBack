import { ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatRepository } from 'src/common/repositories/chat.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createChatRoom(diaryId: Types.ObjectId) {
    const isExist = await this.chatRepository.exist(diaryId);
    if (isExist) {
      throw new ForbiddenException('이미 채팅방이 존재합니다.');
    }
    return await this.chatRepository.create(diaryId);
  }
}
