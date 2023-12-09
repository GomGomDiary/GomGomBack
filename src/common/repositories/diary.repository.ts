import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Diary, DiaryDocumentType } from '../../models/diary.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DiaryPostDto } from '../dtos/diary.post.dto';
import { QuestionShowDto } from '../dtos/question.get.dto';

interface DiaryWithAnswerCount extends Diary {
  answerCount: number;
}

@Injectable()
export class DiaryRepository {
  constructor(
    @InjectModel(Diary.name) private readonly diaryModel: Model<Diary>,
  ) {}

  /**
   * 해당 코드는 Duplication을 체크하는 기능으로서
   * 해당 유저가 없는 경우 에러를 뱉으면 안됩니다.
   * 즉, orFail을 사용해서는 안됩니다.
   */
  async checkDuplication(diaryId: string, clientId: string) {
    try {
      return !!(await this.diaryModel
        .findOne({
          _id: diaryId,
          'answerList._id': clientId,
        })
        .lean()
        .exec());
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async checkOwnership(clientId: string) {
    return !!(await this.diaryModel.exists({ _id: clientId }).lean().exec());
  }

  async checkAnswerer(clientId: string, diaryId: mongoose.Types.ObjectId) {
    return !!(await this.diaryModel
      .exists({ _id: diaryId, 'answerList._id': clientId })
      .lean()
      .exec());
  }

  async create(diary: DiaryPostDto) {
    return await this.diaryModel.create(diary);
  }

  async createWithId(id: string, body: DiaryPostDto) {
    return await this.diaryModel.create({ _id: id, ...body });
  }

  async existAsAnswerer(id: string) {
    /**
     * id 가 undefined일 경우 findOne이 첫 요소를 반환
     */
    if (!id) {
      return false;
    }
    return !!(await this.diaryModel.exists({ 'answerList._id': id }).exec());
  }

  async existAsDiaryAnswerer(diaryId: string, cookieId: string) {
    // check diaryId, cookieId is undefined
    return !!(await this.diaryModel
      .exists({
        _id: diaryId,
        'answerList._id': cookieId,
      })
      .exec());
  }

  async findDiaryWithoutAnswers(
    diaryId: string,
    start: number,
    end: number,
  ): Promise<DiaryWithAnswerCount> {
    try {
      return (
        await this.diaryModel.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(diaryId) } },
          {
            $project: {
              _id: 1,
              questioner: 1,
              answerList: {
                $map: {
                  input: { $slice: ['$answerList', start, end] },
                  as: 'answer',
                  in: {
                    _id: '$$answer._id',
                    answerer: '$$answer.answerer',
                    createdAt: '$$answer.createdAt',
                    updatedAt: '$$answer.updatedAt',
                  },
                },
              },
              answerCount: { $size: '$answerList' },
            },
          },
        ])
      )[0];
    } catch (err) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
  }

  async findDiaryWithAnswerId(diaryId: string, answerId: string) {
    try {
      return await this.diaryModel
        .findOne(
          {
            _id: diaryId,
            'answerList._id': answerId,
          },
          {
            questioner: 1,
            question: 1,
            answerList: {
              $elemMatch: {
                _id: answerId,
              },
            },
          },
        )
        .lean()
        .orFail()
        .exec();
    } catch (err) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
  }

  async findOne(diaryId: string) {
    try {
      return await this.diaryModel
        .findOne({ _id: diaryId })
        .lean<Diary>()
        .orFail()
        .exec();
    } catch (err) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
  }

  async findQuestion(diaryId: string) {
    try {
      return await this.diaryModel
        .findOne(
          {
            _id: diaryId,
          },
          {
            question: 1,
          },
        )
        .lean<QuestionShowDto>()
        .orFail()
        .exec();
    } catch (err) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
  }

  async findById(diaryId: string) {
    try {
      /**
       * casue of using `save` in postAnswer
       * do not use lean
       */
      return this.diaryModel.findById(diaryId).orFail().exec();
    } catch (err) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
  }

  async findField(
    diaryId: string,
    field: {
      [T in keyof DiaryDocumentType]?: number | string;
    },
  ) {
    try {
      return await this.diaryModel
        .findOne(
          {
            _id: diaryId,
          },
          field,
        )
        .lean<typeof field & { _id: mongoose.Types.ObjectId }>()
        .orFail()
        .exec();
    } catch (err) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
  }

  async save(documents: any[]) {
    try {
      return this.diaryModel.bulkSave(documents);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateOne(diaryId: string, body: DiaryPostDto) {
    return await this.diaryModel.updateOne(
      {
        _id: diaryId,
      },
      {
        $set: { ...body, answerList: [] },
      },
    );
  }

  async getAnswererCount(diaryId: string) {
    return (
      await this.diaryModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(diaryId),
          },
        },
        {
          $project: {
            _id: 1,
            answerCount: { $size: '$answerList' },
          },
        },
      ])
    )[0];
  }
}