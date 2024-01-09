import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from 'src/models/chat.schema';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from '../errors/customError';
import { ChatDto } from '../dtos/chat.dto';

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
  ) {}

  async paginate() {
    try {
      return await this.chatModel.find();
    } catch (err) {
      const customError: CustomErrorOptions = {
        where: 'find Chat Message',
        information: {
          test: 'test',
        },
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async create(data: ChatDto) {
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