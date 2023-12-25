import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiaryRepository } from '../common/repositories/diary.repository';
import { DiaryPostDto } from '../common/dtos/diary.post.dto';
import { Response } from 'express';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AnswerPostDto } from '../common/dtos/answer.post.dto';
import { Answer } from '../models/diary.schema';
import { QuestionShowDto } from '../common/dtos/question.get.dto';
import { ANSWERERS } from 'src/utils/constants';
import { CacheRepository } from '../common/repositories/cache.repository';
import { DiaryIdDto } from 'src/common/dtos/diaryId.dto';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from 'src/common/errors/customError';
import { PaginateAnswererDto } from 'src/common/dtos/answerer.get.dto';

@Injectable()
export class DiaryService {
  constructor(
    private readonly diaryRepository: DiaryRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheRepository,
  ) {}

  private setDiaryCookies(res: Response, value: string) {
    /**
     *  diaryAddress cookieOption ( for production client )
     *  {
     *        domain: 'gomgomdiary.site',
     *        expires: new Date(253402300000000),
     *        secure : true,
     *  };
     *
     *  diaryUser cookieOption ( for production server )
     *  {
     *        httpOnly: true,
     *        signed: true,
     *        domain: 'gomgomdiary.site',
     *        expires: new Date(253402300000000),
     *        secure : true,
     *  };
     */

    /**
     *
     *  diaryAddress cookieOption ( for development client )
     *  {
     *        expires: new Date(253402300000000),
     *  };
     *
     *  diaryUser cookieOption ( for development server )
     *  {
     *        httpOnly: true,
     *        expires: new Date(253402300000000),
     *  };
     */

    if (this.configService.get('NODE_ENV') === 'production') {
      res.cookie('diaryUser', value, {
        httpOnly: true,
        signed: true,
        domain: 'gomgomdiary.site',
        expires: new Date(253402300000000),
        secure: true,
      });
      res.cookie('diaryAddress', value, {
        domain: 'gomgomdiary.site',
        expires: new Date(253402300000000),
        secure: true,
      });
      return;
    }

    res.cookie('diaryUser', value, {
      httpOnly: true,
      expires: new Date(253402300000000),
    });
    res.cookie('diaryAddress', value, {
      expires: new Date(253402300000000),
    });
  }

  async checkDiaryOwnership(clientId: string) {
    if (!clientId) {
      return false;
    }
    return this.diaryRepository.checkOwnership(clientId);
  }

  async checkAnswerer(clientId: string, diaryIdDto: DiaryIdDto) {
    if (!clientId) {
      return false;
    }
    return this.diaryRepository.checkAnswerer(clientId, diaryIdDto.diaryId);
  }

  async getQuestion(diaryId: string): Promise<QuestionShowDto> {
    const question = await this.diaryRepository.findQuestion(diaryId);
    if (!question) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
    return question;
  }

  async postQuestion({
    body,
    clientId,
    res,
  }: {
    body: DiaryPostDto;
    clientId: string;
    res: Response;
  }) {
    try {
      const isDiaryOwner = await this.diaryRepository.checkOwnership(clientId);
      /**
       * if Questioner
       * update Diary
       * -> soft delete
       */
      if (isDiaryOwner) {
        await this.diaryRepository.updateOne(clientId, body);
        res.status(HttpStatus.NO_CONTENT);
        return;
      }
      /**
       * if Answerer o (Questioner x)
       * create Diary
       */
      const isAnswerer = await this.diaryRepository.existAsAnswerer(clientId);
      if (isAnswerer) {
        await this.diaryRepository.createWithId(clientId, body);
        return;
      }
      /**
       * if Newbie (Questioner x, Answerer x)
       * create Diary && set cookie
       */
      const diary = await this.diaryRepository.create(body);

      this.setDiaryCookies(res, diary._id.toString());
    } finally {
      /**
       * Delete cache
       * /${ANSWERERS}/${clientId}
       * /${ANSWER}/${clientId}/*
       */
      const keys = await this.cacheService.keys();

      const promises: Promise<void>[] = [];
      for (const key of keys) {
        if (key.includes(`${clientId}`)) {
          promises.push(this.cacheService.del(key.replace('/v1/diary/', '')));
        }
      }
      await Promise.all(promises);
    }
  }

  async getAnswer({
    diaryId,
    answerId,
  }: {
    diaryId: string;
    answerId: string;
  }) {
    const diary = await this.diaryRepository.findDiaryWithAnswerId(
      diaryId,
      answerId,
    );
    if (!diary) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
    const { answerList, ...question } = diary;
    const answer = diary.answerList[0];

    const response = {
      question: { ...question },
      answer: { ...answer },
    };

    return response;
  }

  async getAnswerers(diaryId: string, query: PaginateAnswererDto) {
    const diary = await this.diaryRepository.findDiaryWithoutAnswers(
      diaryId,
      query.start,
      query.take,
    );
    if (!diary) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }

    const response = {
      _id: diaryId,
      questioner: diary.questioner,
      answererList: diary.answerList,
      answerCount: diary.answerCount,
    };

    return response;
  }

  async postAnswer({
    diaryId,
    clientId,
    answer,
    res,
  }: {
    diaryId: string;
    clientId: string;
    answer: AnswerPostDto;
    res: Response;
  }) {
    if (diaryId === clientId) {
      throw new BadRequestException('자신의 다이어리엔 쓸 수 없습니다.');
    }

    const isDuplication = await this.diaryRepository.checkDuplication(
      diaryId,
      clientId,
    );
    if (isDuplication) {
      throw new ConflictException('답변을 이미 작성했습니다.');
    }

    let id: mongoose.Types.ObjectId;
    /**
     * if Newbie
     */
    if (!clientId) {
      id = new mongoose.Types.ObjectId();

      /**
       * set cookie
       */
      this.setDiaryCookies(res, id.toString());
    } else {
      id = new mongoose.Types.ObjectId(clientId);
    }

    const diary = await this.diaryRepository.findById(diaryId);
    if (!diary) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }

    if (diary.question.length !== answer.answers.length) {
      throw new BadRequestException(
        'question 배열과 answer 배열의 길이가 다릅니다.',
      );
    }

    diary.answerList.push({ ...answer, _id: id } as Answer);

    /**
     * NOW : 정교하게 캐싱을 적용하려니 가독성이 심히 떨어져 잠시 pending
     * TODO : 마지막 start 부분 caching만 삭제
     */

    // const answerCount = await this.diaryRepository.getAnswererCount(diaryId);
    // const cacheKeyListToDelete = [];
    // for (const page of DEFAULT_PAGINATE) {
    //   const cacheKeyToDelete = answerCount - (answerCount % page);
    //   cacheKeyListToDelete.push(cacheKeyToDelete);
    // }

    try {
      const keys = await this.cacheService.keys();
      const promises: Promise<void>[] = [];
      for (const key of keys) {
        if (key.includes(`${ANSWERERS}/${diaryId}`)) {
          promises.push(this.cacheService.del(key.replace('/v1/diary/', '')));
        }
      }
      await Promise.all([this.diaryRepository.save([diary]), ...promises]);
    } catch (err) {
      const customError: CustomErrorOptions = {
        information: {
          diaryId,
          diary,
        },
        where: 'Service - postAnswer',
        err,
      };
      throw new CustomInternalServerError(customError);
    }
  }

  async getChallenge(diaryId: string) {
    const challengeWithQuestioner = await this.diaryRepository.findField(
      diaryId,
      {
        challenge: 1,
        questioner: 1,
      },
    );

    if (!challengeWithQuestioner) {
      throw new NotFoundException('Diary가 존재하지 않습니다.');
    }
    return challengeWithQuestioner;
  }

  async postUpdatingSignal() {
    const keys = await this.cacheService.keys();
    return keys;
  }
}
