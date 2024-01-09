import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { History } from 'src/models/history.schema';
import { HistoryGetDto } from '../dtos/history.get.dto';
import { HistoryIdDto } from '../dtos/historyId.dto';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from '../errors/customError';
import { PaginateQueryType } from 'src/utils/pagination';

@Injectable()
export class HistoryRepository {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<History>,
  ) {}

  async findHistoryList(query: PaginateQueryType, take = 5) {
    try {
      return await this.historyModel
        .find(query, { _id: 1, createdAt: 1, numberOfAnswerers: 1 })
        .lean<[HistoryGetDto]>()
        .sort({ _id: 1 })
        .limit(take)
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          query,
          take,
        },
        where: 'findHistoryList',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async findOne(historyIdDto: HistoryIdDto, clientId: Types.ObjectId) {
    try {
      return await this.historyModel
        .findOne(
          { _id: historyIdDto.historyId, diaryId: clientId },
          { answerList: { $slice: [0, 5] } },
        )
        .lean<History>()
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          historyIdDto,
          clientId,
        },
        where: 'findOne',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }
}
