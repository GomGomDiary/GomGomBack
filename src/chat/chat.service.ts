import { ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateChatRoomDto } from 'src/common/dtos/request/chatRoom.post.dto';
import { ChatRepository } from 'src/common/repositories/chat.repository';
import { DiaryRepository } from 'src/common/repositories/diary.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly diaryRepository: DiaryRepository,
  ) {}

  async createChatRoom(diaryId: Types.ObjectId, dto: CreateChatRoomDto) {
    const isExist = await this.chatRepository.exist(diaryId, dto.answererId);
    if (isExist) {
      throw new ForbiddenException('이미 채팅방이 존재합니다.');
    }
    const isDiaryOwner = await this.diaryRepository.checkOwnership(diaryId);
    if (!isDiaryOwner) {
      throw new ForbiddenException('다이어리 주인이 아닙니다.');
    }
    return await this.chatRepository.create(diaryId, dto);
  }

  // async exist(roomId: Types.ObjectId) {
  //   return await this.chatRepository.exist(roomId, roomId);
  // }
}
