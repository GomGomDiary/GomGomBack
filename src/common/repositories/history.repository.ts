import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { DiaryHistory } from 'src/models/diaryHistory.schema';
import { HistoryGetDto } from '../dtos/history.get.dto';
import { DiaryIdDto } from '../dtos/diaryId.dto';

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
      throw new InternalServerErrorException(err);
    }
  }

  async findOne(diaryIdDto: DiaryIdDto, clientId: ObjectId) {
    try {
      return await this.histoyModel
        .findOne({ _id: diaryIdDto.diaryId, diaryId: clientId })
        .lean<DiaryHistory>()
        .exec();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
