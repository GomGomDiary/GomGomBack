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

  async checkDuplication(diaryId: string, clientId: string) {
    try {
      return !!(await this.diaryModel.findOne({
        _id: diaryId,
        'answerList._id': clientId,
      }));
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async create(diary: DiaryPostDto) {
    return await this.diaryModel.create(diary);
  }

  async findById(diaryId: string) {
    try {
      return await this.diaryModel.findById(diaryId).orFail();
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

  async existAsDiaryOwner(id: string) {
    return !!(await this.diaryModel.exists({ _id: id }));
  }

  async existAsAnswerer(id: string) {
    return !!(await this.diaryModel.exists({ 'answerList._id': id }));
  }

  async existAsDirayAnswerer(diaryId: string, cookieId: string) {
    return !!(await this.diaryModel.exists({
      _id: diaryId,
      'answerList._id': cookieId,
    }));
  }

  async findAnswerers(diaryId: string) {
    try {
      return await this.diaryModel
        .findOne(
          { _id: diaryId },
          {
            'answerList.answers': 0,
          },
        )
        .orFail();
    } catch (err) {
      throw new NotFoundException('Diary not found');
    }
  }

  async findAnswerByAnswerId(diaryId: string, answerId: string) {
    try {
      return await this.diaryModel
        .findOne(
          {
            _id: diaryId,
            'answerList._id': answerId,
          },
          {
            answerList: {
              $elemMatch: {
                _id: answerId,
              },
            },
          },
        )
        .orFail();
    } catch (err) {
      throw new NotFoundException('Diary not found');
    }
  }

  async updateOne(diaryId: string, body: DiaryPostDto) {
    return await this.diaryModel.updateOne(
      {
        _id: diaryId,
      },
      {
        $set: body,
      },
    );
  }
}
