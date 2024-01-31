import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/models/chat.schema';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from '../errors/customError';
import { PaginateQueryType } from 'src/utils/pagination';

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
  ) {}

  async paginate(
    query: PaginateQueryType,
    take = 10,
    clientId: Types.ObjectId,
  ) {
    try {
      const result = await this.chatModel.aggregate([
        { $match: query },
        {
          $addFields: {
            isSender: { $eq: ['$clientId', clientId] },
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            chat: 1,
            nickname: 1,
            clientId: 1,
            isSender: 1,
          },
        },
        { $sort: { _id: -1 } },
        { $limit: take },
      ]);
      return result.reverse();
    } catch (err) {
      const customError: CustomErrorOptions = {
        where: 'find Chat Message',
        information: {
          query,
          take,
          clientId,
        },
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async create(data: Chat) {
    try {
      const { _id } = await this.chatModel.create({ ...data });
      return await this.chatModel
        .findOne(_id, {
          _id: 0,
          __v: 0,
        })
        .lean()
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          data,
        },
        where: 'create Chat Message',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }
}
