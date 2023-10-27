import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Diary } from './diary.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DiaryRepository {
  constructor(
    @InjectModel(Diary.name) private readonly diaryModel: Model<Diary>,
  ) {}

  async checkDuplication({ questionId, clientId }) {
    try {
      return !!(await this.diaryModel.findOne({
        _id: questionId,
        'answerList._id': clientId,
      }));
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async create(diary: any) {
    return await this.diaryModel.create(diary);
  }

  async findById(id: string) {
    try {
      return await this.diaryModel.findById(id).orFail();
    } catch (err) {
      throw new NotFoundException('Diary not found');
    }
  }

  async save(documents: any[]) {
    try {
      return await this.diaryModel.bulkSave(documents);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async exist(id: string) {
    return !!(await this.diaryModel.exists({ _id: id }));
  }

  async findAnswerers(questionId: string) {
    try {
      return await this.diaryModel
        .findOne(
          { _id: questionId },
          {
            'answerList.answers': 0,
          },
        )
        .orFail();
    } catch (err) {
      throw new NotFoundException('Diary not found');
    }
  }

  async findAnswerByClientId({ questionId, clientId }) {
    try {
      await this.diaryModel
        .findOne(
          {
            _id: questionId,
            'answerList._id': clientId,
          },
          {
            answerList: {
              $elemMatch: {
                _id: clientId,
              },
            },
          },
        )
        .orFail();
    } catch (err) {
      throw new NotFoundException('Diary not found');
    }
  }
}
