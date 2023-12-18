import { Injectable } from '@nestjs/common';
import { Diary, DiaryDocumentType } from '../../models/diary.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Document, Model } from 'mongoose';
import { DiaryPostDto } from '../dtos/diary.post.dto';
import { QuestionShowDto } from '../dtos/question.get.dto';
import {
  CustomInternalServerError,
  CustomErrorOptions,
} from '../errors/customError';

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
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
          clientId,
        },
        where: 'checkDuplication',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async checkOwnership(clientId: string) {
    try {
      return !!(await this.diaryModel.exists({ _id: clientId }).lean().exec());
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          clientId,
        },
        where: 'checkOwnership',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async checkAnswerer(clientId: string, diaryId: mongoose.Types.ObjectId) {
    try {
      return !!(await this.diaryModel
        .exists({ _id: diaryId, 'answerList._id': clientId })
        .lean()
        .exec());
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          clientId,
          diaryId,
        },
        where: 'checkAnswerer',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async create(diary: DiaryPostDto) {
    try {
      return await this.diaryModel.create(diary);
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diary,
        },
        where: 'create',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async createWithId(id: string, body: DiaryPostDto) {
    try {
      return await this.diaryModel.create({ _id: id, ...body });
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          id,
          body,
        },
        where: 'createWithId',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async existAsAnswerer(id: string) {
    /**
     * id 가 undefined일 경우 findOne이 첫 요소를 반환
     */
    if (!id) {
      return false;
    }
    try {
      return !!(await this.diaryModel.exists({ 'answerList._id': id }).exec());
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          id,
        },
        where: 'existAsAnswerer',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async existAsDiaryAnswerer(diaryId: string, cookieId: string) {
    // check diaryId, cookieId is undefined
    try {
      return !!(await this.diaryModel
        .exists({
          _id: diaryId,
          'answerList._id': cookieId,
        })
        .exec());
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
          cookieId,
        },
        where: 'existAsDiaryAnswerer',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
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
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
          start,
          end,
        },
        where: 'findDiaryWithoutAnswers',
        err,
      };
      throw new CustomInternalServerError(customError);
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
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
          answerId,
        },
        where: 'findDiaryWithAnswerId',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async findOne(diaryId: string) {
    try {
      return await this.diaryModel
        .findOne({ _id: diaryId })
        .lean<Diary>()
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
        },
        where: 'findOne',
        err,
      };
      throw new CustomInternalServerError(customError);
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
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
        },
        where: 'findQuestion',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async findById(diaryId: string) {
    try {
      /**
       * casue of using `save` in postAnswer
       * do not use lean
       */
      return this.diaryModel.findById(diaryId).exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
        },
        where: 'findById',
        err,
      };
      throw new CustomInternalServerError(customError);
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
        .lean<Diary>()
        .exec();
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
        },
        where: 'findField',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async save(documents: unknown[]) {
    try {
      return this.diaryModel.bulkSave(documents as Document[]);
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          documents,
        },
        where: 'save',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async updateOne(diaryId: string, body: DiaryPostDto) {
    try {
      return await this.diaryModel.updateOne(
        {
          _id: diaryId,
        },
        {
          $set: { ...body, answerList: [] },
        },
      );
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
          body,
        },
        where: 'updateOne',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async getAnswererCount(diaryId: string) {
    try {
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
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
        },
        where: 'getAnswererCount',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }
}
