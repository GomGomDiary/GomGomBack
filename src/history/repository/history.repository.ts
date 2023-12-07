import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DiaryHistory } from 'src/entity/diaryHistory.schema';
import { DiaryIdDto } from '../dto/diaryId.dto';
import { HistoryGetDto } from '../dto/history.get.dto';
import { ObjectId } from 'mongoose';

@Injectable()
export class HistoryRepository {
  constructor(
    @InjectModel(DiaryHistory.name)
    private readonly histoyModel: Model<DiaryHistory>,
  ) {}

  async findHistoryList(query, take = 5) {
    return await this.histoyModel
      .find(query, { _id: 1, createdAt: 1, numberOfAnswerers: 1 })
      .lean<[HistoryGetDto]>()
      .limit(take)
      .exec();
  }
}
