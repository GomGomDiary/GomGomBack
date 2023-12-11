import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { DiaryHistory } from 'src/models/diaryHistory.schema';
import { HistoryGetDto } from '../dtos/history.get.dto';
import { HistoryIdDto } from '../dtos/historyId.dto';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from '../errors/customError';

@Injectable()
export class HistoryRepository {
  constructor(
    @InjectModel(DiaryHistory.name)
    private readonly histoyModel: Model<DiaryHistory>,
  ) {}

  async findHistoryList(query, take = 5) {
    try {
      return await this.histoyModel
        .find(query, { _id: 1, createdAt: 1, numberOfAnswerers: 1 })
        .lean<[HistoryGetDto]>()
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

  async findOne(historyIdDto: HistoryIdDto, clientId: ObjectId) {
    try {
      return await this.histoyModel
        .findOne(
          { _id: historyIdDto.historyId, diaryId: clientId },
          { answerList: { $slice: [0, 5] } },
        )
        .lean<DiaryHistory>()
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
