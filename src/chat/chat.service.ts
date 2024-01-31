import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { CreateChatRoomDto } from 'src/common/dtos/request/chatRoom.post.dto';
import { RoomIdDto } from 'src/common/dtos/request/roomId.dto';
import { ChatRepository } from 'src/common/repositories/chat.repository';
import { DiaryRepository } from 'src/common/repositories/diary.repository';
import { ChatRoom } from 'src/models/chatRoom.schema';
import { Diary } from 'src/models/diary.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly diaryRepository: DiaryRepository,
    private readonly authService: AuthService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Diary.name) private readonly diaryModel: Model<Diary>,
    @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoom>,
  ) {}

  async createChatRoom(diaryId: Types.ObjectId, dto: CreateChatRoomDto) {
    const isChatRoomExist = await this.chatRepository.exist(
      diaryId,
      dto.answererId,
    );
    if (isChatRoomExist) {
      throw new ConflictException('이미 채팅방이 존재합니다.');
    }
    const isDiaryOwner = await this.diaryRepository.checkOwnership(diaryId);
    if (!isDiaryOwner) {
      throw new ForbiddenException('다이어리 주인이 아닙니다.');
    }
    const isAnswerer = await this.diaryRepository.checkAnswerer(
      dto.answererId,
      diaryId,
    );
    if (!isAnswerer) {
      throw new ForbiddenException('답장한 사람이 아닙니다.');
    }
    const session = await this.connection.startSession();
    try {
      let _id: Types.ObjectId | null = null;
      await session.withTransaction(async () => {
        _id = await this.chatRepository.create(diaryId, dto, session);
        await this.diaryModel.updateOne(
          {
            _id: diaryId,
            'answerList._id': dto.answererId,
          },
          {
            $set: {
              'answerList.$.roomId': _id,
            },
          },
          { session },
        );
      });
      return { _id };
    } finally {
      session.endSession();
    }
  }

  async createToken(clientId: Types.ObjectId) {
    const payload = { sub: clientId };
    return {
      chatToken: await this.authService.createToken(payload),
    };
  }

  async getNickname(roomIdDto: RoomIdDto) {
    const chatRoom = await this.chatRoomModel
      .findOne(
        {
          _id: roomIdDto.roomId,
        },
        { questionerId: 1, answererId: 1 },
      )
      .lean();
    if (!chatRoom) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }
    const diary = await this.diaryModel
      .findOne(
        {
          _id: chatRoom.questionerId,
          'answerList._id': chatRoom.answererId,
        },
        {
          questioner: 1,
          answerList: {
            $elemMatch: {
              _id: chatRoom.answererId,
            },
          },
        },
      )
      .lean();
    if (!diary) {
      throw new NotFoundException('다이어리를 찾을 수 없습니다.');
    }
    const questioner = diary.questioner;
    const answerer = diary.answerList[0].answerer;

    return {
      questioner,
      answerer,
    };
  }
}
