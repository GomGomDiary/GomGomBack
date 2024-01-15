import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
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

  async create(
    questionerId: Types.ObjectId,
    dto: CreateChatRoomDto,
    session?: ClientSession,
  ) {
    try {
      const chatRoom = await this.chatRoomModel.create(
        [
          {
            questionerId: questionerId,
            ...dto,
          },
        ],
        { session },
      );
      const _id = chatRoom[0]._id;
      return _id;
      // return await this.chatRoomModel.findOne(_id, {}).lean().exec();
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
        questionerId,
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

  async findChatRoom(clientId: Types.ObjectId, roomId: Types.ObjectId) {
    // roomId -> find chatRoom({$or : [{_id : data.roomId } && { questionerId : clientId}, { _id : data.roomId } && { answererId : clientId }])
    const t = await this.chatRoomModel
      .findOne({
        $or: [
          { $and: [{ _id: roomId }, { questionerId: clientId }] },
          { $and: [{ _id: roomId }, { answererId: clientId }] },
        ],
      })
      .lean()
      .exec();
    return t;
  }
}
