import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Diary } from './diary.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiaryPostDto } from './dto/diary.post.dto';

@Injectable()
export class DiaryRepository {
  constructor(
    @InjectModel(Diary.name) private readonly diaryModel: Model<Diary>,
  ) {}

  createWithId(id: string, body: DiaryPostDto) {
    return this.diaryModel.create({ _id: id, ...body });
  }

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

  async create(diary: DiaryPostDto) {
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

  async existAsQuestioner(id: string) {
    return !!(await this.diaryModel.exists({ _id: id }));
  }
  async existAsAnswerer(id: string) {
    return !!(await this.diaryModel.exists({ 'answerList._id': id }));
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

  async updateOne(id: string, body: DiaryPostDto) {
    return await this.diaryModel.updateOne(
      {
        _id: id,
      },
      {
        $set: body,
      },
      {
        fields: '_id',
      },
    );
  }
}
