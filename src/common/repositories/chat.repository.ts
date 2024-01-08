import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from '../errors/customError';
import { ChatRoom } from 'src/models/chatRoom.schema';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoom>,
  ) {}

  async create(diaryId: Types.ObjectId) {
    try {
      return await this.chatRoomModel.create({ roomId: diaryId });
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
        },
        where: 'createChatRoom',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async exist(roomId: Types.ObjectId) {
    try {
      return !!(await this.chatRoomModel.exists({
        roomId,
      }));
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          roomId,
        },
        where: 'chatRoom exist',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }
}
