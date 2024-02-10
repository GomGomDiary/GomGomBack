import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DiaryRepository } from '../common/repositories/diary.repository';
import { CreateDiaryDto } from '../common/dtos/request/diary.post.dto';
import { Response } from 'express';
import mongoose, { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CreateAnswerDto } from '../common/dtos/request/answer.post.dto';
import { Answer, Diary } from '../models/diary.schema';
import { ANSWERERS } from 'src/utils/constants';
import { CacheRepository } from '../common/repositories/cache.repository';
import {
  CustomErrorOptions,
  CustomInternalServerError,
} from 'src/common/errors/customError';
import { PaginateAnswererDto } from 'src/common/dtos/response/answerer.get.dto';
import { DiaryDto } from 'src/common/dtos/diary.dto';
import { AnswerGetDto } from 'src/common/dtos/response/answer.get.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { History } from 'src/models/history.schema';
import { ChatRoom } from 'src/models/chatRoom.schema';
import { SqsService } from '@ssut/nestjs-sqs';
import { randomUUID } from 'crypto';

@Injectable()
export class DiaryService {
  constructor(
    private readonly diaryRepository: DiaryRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheRepository,
    private readonly sqsService: SqsService,
    @InjectModel(History.name) private readonly historyModel: Model<History>,
    @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoom>,
    @InjectConnection() private readonly connection: mongoose.Connection,
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

  async checkAnswerer(clientId: string, diaryId: Types.ObjectId) {
    if (!clientId) {
      return false;
    }
    return this.diaryRepository.checkAnswerer(clientId, diaryId);
  }

  async getQuestion(
    diaryId: string,
  ): Promise<Pick<DiaryDto, '_id' | 'question'>> {
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
    body: CreateDiaryDto;
    clientId: string;
    res: Response;
  }) {
    let diaryId = clientId;
    try {
      const isDiaryOwner = await this.diaryRepository.checkOwnership(clientId);
      // TODO 3가지 경우 전부 맞게 들어가는지 체크
      /**
       * if Questioner
       * update Diary
       * -> soft delete
       */
      if (isDiaryOwner) {
        const session = await this.connection.startSession();
        try {
          await session.withTransaction(async () => {
            const retentionDiary = (await this.diaryRepository.findOne(
              clientId,
              session,
            )) as Diary;
            const diaryId = retentionDiary._id;

            retentionDiary.createdAt = retentionDiary.updatedAt;
            const answerList = retentionDiary.answerList;
            const chatRoomUpdatePromises = answerList
              .filter((answer) => answer?.roomId)
              .map((answer) =>
                this.chatRoomModel.updateOne(
                  { _id: answer.roomId },
                  { isHistory: true },
                  { session },
                ),
              );

            const { _id, ...rest } = retentionDiary;

            const numberOfAnswerers = retentionDiary.answerList.length;
            const historyCreatePromise = this.historyModel.create(
              [
                {
                  ...rest,
                  diaryId,
                  numberOfAnswerers,
                },
              ],
              { session },
            );
            const diaryUpdatePromise = this.diaryRepository.updateOne(
              clientId,
              body,
              session,
            );
            await Promise.all([
              ...chatRoomUpdatePromises,
              historyCreatePromise,
              diaryUpdatePromise,
            ]);
          });
          res.status(HttpStatus.NO_CONTENT);
          return;
        } finally {
          session.endSession();
        }
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
      diaryId = diary._id.toString();
      this.setDiaryCookies(res, diaryId);
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
      const queueName = this.configService.get<string>('QUEUE_NAME');
      if (!queueName) {
        throw new InternalServerErrorException(
          'queueName이 정의되지 않았습니다.',
        );
      }
      const message = {
        diaryId,
        type: 'aiPostAnswer',
      };
      const randomId = randomUUID();
      try {
        await this.sqsService.send(queueName, {
          id: 'id',
          body: message,
          groupId: 'gomgom',
          deduplicationId: randomId,
        });
      } catch (err) {
        console.log(JSON.stringify(err));
      }
    }
  }

  async getAnswer({
    diaryId,
    answerId,
  }: {
    diaryId: string;
    answerId: string;
  }): Promise<AnswerGetDto> {
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
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const diary = await this.diaryRepository.findDiaryWithoutAnswers(
      diaryId,
      query.start,
      query.take,
      sortOrder,
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
    clientId: string | undefined;
    answer: CreateAnswerDto;
    res?: Response;
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
    if (!clientId && !!res) {
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

  async postUpdatingSignal(body: any) {
    const keys = await this.cacheService.keys();
    const queueName = this.configService.get<string>('QUEUE_NAME');
    if (!queueName) {
      throw new InternalServerErrorException(
        'queueName이 정의되지 않았습니다.',
      );
    }
    const message = body;

    const randomId = randomUUID();
    try {
      await this.sqsService.send(queueName, {
        id: 'id',
        body: message,
        groupId: 'test',
        deduplicationId: randomId,
      });
    } catch (err) {
      console.log(err);
    }
    return keys;
  }
}
