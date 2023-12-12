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
import { AnswererGetDto } from 'src/common/dtos/answerer.get.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { QuestionShowDto } from 'src/common/dtos/question.get.dto';
import { AnswerGetDto } from 'src/common/dtos/answer.get.dto';
import { DiaryTokenShowDto } from 'src/common/dtos/countersign.res.dto';
import { ChallengeGetDto } from 'src/common/dtos/challenge.res.dto';

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
      const dtoObject = plainToClass(QuestionShowDto, resultJson);
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
      const query = 'start=0&take=5';
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

    it('start = 10, take = 5일 때 answerList의 길이는 5여야 한다.', async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app.getHttpServer())
            .post(`/v1/diary/answer/${diaryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              answers: ['yoyoo', '7', 'food', 'hobby', 'nodejs'],
              answerer: `client${i + 1}`,
            }),
        );
      }
      await Promise.all(promises);
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}?start=10&take=5`,
      );

      expect(result.statusCode).toBe(200);
      expect(result.body.answererList.length).toBe(5);
    });

    it('response는 AnswererGetDto와 validation시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}?start=0&take=5`,
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

    it('diaryId param이 존재하지 않을 경우 404를 반환한다.', async () => {
      const query = 'start=0&take=5';
      const nonExistentDiaryId = '1'.repeat(24);
      const result = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${nonExistentDiaryId}?${query}`,
      );

      expect(result.statusCode).toBe(404);
    });

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
