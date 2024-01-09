import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from '../errors/customError';
import { ChatRoom } from 'src/models/chatRoom.schema';
import { CreateChatRoomDto } from '../dtos/request/chatRoom.post.dto';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoom>,
  ) {}

  async create(questionerId: Types.ObjectId, dto: CreateChatRoomDto) {
    try {
      const { _id } = await this.chatRoomModel.create({
        questionerId: questionerId,
        ...dto,
      });
      return await this.chatRoomModel.findOne(_id, {}).lean().exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          questionerId,
          dto,
        },
        where: 'createChatRoom',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async exist(questionerId: Types.ObjectId, answererId: Types.ObjectId) {
    try {
      return !!(await this.chatRoomModel.exists({
        roomId: questionerId,
        answererId,
      }));
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          roomId: questionerId,
        },
        where: 'chatRoom exist',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }
}
