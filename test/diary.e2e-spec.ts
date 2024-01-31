import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setUp } from 'src/utils/setUp';
import { clientId1_Answer, diaryData } from './utils/constants';
import { createDiary } from './utils/createDiary';
import { createDiaryWithAnswer } from './utils/createDiaryWithAnswer';
import { AnswererGetDto } from 'src/common/dtos/response/answerer.get.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QuestionShowDto } from 'src/common/dtos/response/question.get.dto';
import { AnswerGetDto } from 'src/common/dtos/response/answer.get.dto';
import { DiaryTokenShowDto } from 'src/common/dtos/response/countersign.res.dto';
import { HistoryGetListDto } from 'src/common/dtos/response/history.get.dto';
import { ChallengeGetDto } from 'src/common/dtos/response/challenge.get.dto';

describe('Diary Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    console.log(process.env.MONGO_URI);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGO_URI'),
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    setUp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('(GET) /diary - 다이어리 존재 여부 확인', () => {
    let diaryId: string, clientId1: string;

    beforeEach(async () => {
      ({ diaryId, clientId1 } = await createDiaryWithAnswer(app, diaryData));
    });

    it('다이어리가 존재할 경우 true를 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/diary')
        .set('Cookie', [`diaryUser=${diaryId}`]);

      expect(result.statusCode).toBe(200);
      expect(result.text).toEqual('true');
    });

    describe('다이어리가 존재하지 않을 경우 false를 반환한다.', () => {
      it('Cookie가 없을 경우', async () => {
        const result = await request(app.getHttpServer()).get('/v1/diary');

        expect(result.statusCode).toBe(200);
        expect(result.text).toEqual('false');
      });

      it('Answer cookie의 경우', async () => {
        const result = await request(app.getHttpServer())
          .get('/v1/diary')
          .set('Cookie', [`diaryUser=${clientId1}`]);

        expect(result.statusCode).toBe(200);
        expect(result.text).toEqual('false');
      });
    });
  });

  describe('(GET) /diary/:diaryId - 답변 존재 여부 확인', () => {
    let diaryId: string, clientId1: string;

    beforeEach(async () => {
      ({ diaryId, clientId1 } = await createDiaryWithAnswer(app, diaryData));
    });

    it('diaryId가 없는 경우 false를 반환한다.', async () => {
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/${nonExistentDiaryId}`,
      );

      expect(result.statusCode).toBe(200);
      expect(result.text).toEqual('false');
    });

    it('diaryId가 잘못 된 경우 400을 반환한다.', async () => {
      const wrongDiaryId = '1'.repeat(23);
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/${wrongDiaryId}`,
      );

      expect(result.statusCode).toBe(400);
    });

    it('답변이 존재할 경우 true를 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/${diaryId}`)
        .set('Cookie', [`diaryUser=${clientId1}`]);

      expect(result.statusCode).toBe(200);
      expect(result.text).toEqual('true');
    });
  });

  describe('(POST) /diary/question - 질문 쓰기', () => {
    it('처음 질문을 쓰는 경우 201을 반환한다.', async () => {
      const result = await createDiary(app, diaryData);

      expect(result.statusCode).toBe(201);
    });

    it('질문을 이미 썼을 경우 204를 반환한다.', async () => {
      const { diaryId } = await createDiaryWithAnswer(app, diaryData);
      const result = await createDiary(app, diaryData, diaryId);

      expect(result.statusCode).toBe(204);
    });

    it('질문을 재작성할 경우 history가 쌓여야 한다.', async () => {
      // 다이어리 작성
      const { diaryId } = await createDiaryWithAnswer(app, diaryData);

      // 다이어리 재작성
      await createDiary(app, diaryData, diaryId);

      // 작성된 다이어리 히스토리 리스트 가져오기
      const historyResponse = await request(app.getHttpServer())
        .get(`/v1/history?take=5`)
        .set('Cookie', [`diaryUser=${diaryId}`]);
      const history: HistoryGetListDto = JSON.parse(historyResponse.text);

      // history의 길이가 1 이상인지 검증
      expect(history.historyList.length).toBe(1);
    });
  });

  describe('(POST) /diary/answer/:diaryId - 답변 쓰기', () => {
    let diaryId: string, clientId1: string, token: string;

    beforeEach(async () => {
      ({ diaryId, clientId1, token } = await createDiaryWithAnswer(
        app,
        diaryData,
      ));
    });

    it('스스로에게 답변한 경우 400을 반환한다.', async () => {
      const selfAnswer = await request(app.getHttpServer())
        .post(`/v1/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${diaryId}`])
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);

      expect(selfAnswer.statusCode).toBe(400);
    });

    it('중복 답변의 경우 409를 반환한다.', async () => {
      const DuplicationAnswer = await request(app.getHttpServer())
        .post(`/v1/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${clientId1}`])
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);

      expect(DuplicationAnswer.statusCode).toBe(409);
    });

    it('답변 쓰기의 경우 201을 반환한다.', async () => {
      const createAnswer = await request(app.getHttpServer())
        .post(`/v1/diary/answer/${diaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);

      expect(createAnswer.statusCode).toBe(201);
    });
  });

  describe('(GET) /diary/question/:diaryId - 질문 보기', () => {
    let diaryId: string, token: string;

    beforeEach(async () => {
      ({ diaryId, token } = await createDiaryWithAnswer(app, diaryData));
    });

    it('token이 없는 경우 경우 401을 반환한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/question/${diaryId}`,
      );

      expect(result.statusCode).toBe(401);
    });

    it('diaryId가 존재하지 않을 경우 404를 반환한다.', async () => {
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/question/${nonExistentDiaryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.statusCode).toBe(404);
    });

    it('response는 QuestionShowDto와 validation시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/question/${diaryId}`)
        .set('Authorization', `Bearer ${token}`);
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToInstance(QuestionShowDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(200);
      expect(errors.length).toBe(0);
    });
  });

  describe('(GET) /diary/answer/:diaryId/:answerId - 답변 보기', () => {
    let diaryId: string, clientId1: string, clientId2: string, token: string;

    beforeEach(async () => {
      ({ diaryId, clientId1, clientId2, token } = await createDiaryWithAnswer(
        app,
        diaryData,
      ));
    });

    it('Cookie가 없을 경우 401을 반환한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answer/${diaryId}/${clientId1}`,
      );
      expect(result.statusCode).toBe(401);
    });

    it('남의 Diary를 접근할 경우 401를 반환한다.', async () => {
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/answer/${nonExistentDiaryId}/${clientId1}`)
        .set('Cookie', [`diaryUser=${diaryId}`]);

      expect(result.statusCode).toBe(401);
    });

    it('clientId1으로 clientId2의 답변을 접근할 경우 401을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/answer/${diaryId}/${clientId2}`)
        .set('Cookie', [`diaryUser=${clientId1}`]);

      expect(result.statusCode).toBe(401);
    });

    it('clientId param이 존재하지 않을 경우 404를 반환한다.', async () => {
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/answer/${diaryId}/${nonExistentDiaryId}`)
        .set('Cookie', [`diaryUser=${diaryId}`]);

      expect(result.statusCode).toBe(404);
    });

    it('response는 AnswerGetDto와 validation시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer())
        .get(`/v1/diary/answer/${diaryId}/${clientId1}`)
        .set('Cookie', [`diaryUser=${diaryId}`]);
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(AnswerGetDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(200);
      expect(errors.length).toBe(0);
    });
  });

  describe('(GET) /diary/answerers/:diaryId - 답변자 보기', () => {
    let diaryId: string, token: string;

    beforeEach(async () => {
      ({ diaryId, token } = await createDiaryWithAnswer(app, diaryData));
    });

    it('diaryId param이 존재하지 않을 경우 404를 반환한다.', async () => {
      const query = 'start=0&take=5&sortOrder=asc';
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${nonExistentDiaryId}?${query}`,
      );

      expect(result.statusCode).toBe(404);
    });

    it('query param이 존재하지 않을 경우 400을 반환한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}`,
      );

      expect(result.statusCode).toBe(400);
    });

    it.each([
      { start: 0, take: 5, sortOrder: 'asc', expected: 5 },
      { start: 10, take: 5, sortOrder: 'asc', expected: 5 },
      { start: 0, take: 10, sortOrder: 'desc', expected: 10 },
      { start: 10, take: 10, sortOrder: 'desc', expected: 10 },
    ])(
      'start = $start, take = $take, sortOrder = $sortOrder일 때, answerList의 길이는 $expected여야 한다.',
      async ({ start, take, sortOrder, expected }) => {
        const promises = Array.from({ length: 20 }, (_, i) => {
          return request(app.getHttpServer())
            .post(`/v1/diary/answer/${diaryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              answers: ['yoyoo', '7', 'food', 'hobby', 'nodejs'],
              answerer: `client${i + 1}`,
            });
        });
        await Promise.all(promises);
        const result = await request(app.getHttpServer()).get(
          `/v1/diary/answerers/${diaryId}?start=${start}&take=${take}&sortOrder=${sortOrder}`,
        );

        expect(result.statusCode).toBe(200);
        expect(result.body.answererList.length).toBe(expected);
      },
    );

    it.each([
      { start: 0, take: 5, sortOrder: 'asc' },
      { start: 10, take: 10, sortOrder: 'desc' },
    ])(
      'sortOrder = $sortOrder일 때, answerList의 순서가 createdAt 기준으로 정렬되어야 한다.',
      async ({ start, take, sortOrder }) => {
        const promises = Array.from({ length: 20 }, (_, i) => {
          return request(app.getHttpServer())
            .post(`/v1/diary/answer/${diaryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              answers: ['yoyoo', '7', 'food', 'hobby', 'nodejs'],
              answerer: `client${i + 1}`,
            });
        });
        await Promise.all(promises);
        const result = await request(app.getHttpServer()).get(
          `/v1/diary/answerers/${diaryId}?start=${start}&take=${take}&sortOrder=${sortOrder}`,
        );

        expect(result.statusCode).toBe(200);

        const isOrdered = result.body.answererList
          .slice(1)
          .every((item: any, i: number) => {
            const previousDate = new Date(
              result.body.answererList[i].createdAt,
            );
            const currentDate = new Date(item.createdAt);

            return sortOrder === 'asc'
              ? currentDate >= previousDate
              : currentDate <= previousDate;
          });
        expect(isOrdered).toBe(true);
      },
    );

    it('response는 AnswererGetDto와 validation시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}?start=0&take=5&sortOrder=asc`,
      );
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(AnswererGetDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(200);
      expect(errors.length).toBe(0);
    });
  });

  describe('(GET) /diary/challenge/:diaryId - challenge 보기', () => {
    let diaryId: string;

    beforeEach(async () => {
      ({ diaryId } = await createDiaryWithAnswer(app, diaryData));
    });
    // it('diaryId param이 존재하지 않을 경우 404를 반환한다.', async () => {
    //   const query = 'start=0&take=5&sortOrder=asc';
    //   const nonExistentDiaryId = '1'.repeat(24);
    //   const result = await request(app.getHttpServer()).get(
    //     `/v1/diary/answerers/${nonExistentDiaryId}?${query}`,
    //   );
    //
    //   expect(result.statusCode).toBe(404);
    // });

    it('response는 ChallengeGetDto와 validation시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/challenge/${diaryId}`,
      );
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(ChallengeGetDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(200);
      expect(errors.length).toBe(0);
    });
  });

  describe('(POST) /diary/countersign/:diaryId - counstersign 검증', () => {
    let result: request.Response;
    let diaryId: string;
    beforeEach(async () => {
      result = await createDiary(app, diaryData);

      const diaryIdCookie = result.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    it('diaryId param이 존재하지 않을 때 404를 반환한다.', async () => {
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer())
        .post(`/v1/diary/countersign/${nonExistentDiaryId}`)
        .send({ countersign: 'first' });

      expect(result.statusCode).toBe(404);
    });

    it('비밀번호가 틀릴 경우 401을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .post(`/v1/diary/countersign/${diaryId}`)
        .send({ countersign: 'wrongPassword' });

      expect(result.statusCode).toBe(401);
    });

    it('response는 DiaryTokenShowDto와 검증시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer())
        .post(`/v1/diary/countersign/${diaryId}`)
        .send({ countersign: 'first' });
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(DiaryTokenShowDto, resultJson);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
      expect(result.statusCode).toBe(201);
    });
  });
});
