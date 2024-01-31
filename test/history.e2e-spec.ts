import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setUp } from 'src/utils/setUp';
import { diaryData } from './utils/constants';
import { createDiaryWithAnswer } from './utils/createDiaryWithAnswer';
import { plainToClass } from 'class-transformer';
import {
  HistoryGetListDto,
  HistoryItemGetDto,
} from 'src/common/dtos/response/history.get.dto';
import { validate } from 'class-validator';

describe('History Controller (e2e)', () => {
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

  describe('(GET) /history - 히스토리 리스트 보기', () => {
    let diaryId: string;

    beforeEach(async () => {
      ({ diaryId } = await createDiaryWithAnswer(app, diaryData));
      ({ diaryId } = await createDiaryWithAnswer(app, diaryData, diaryId));
    });

    it('cookie가 없을 경우 400을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', []);
      expect(result.statusCode).toBe(400);
    });

    it('response는 HistoryGetListDto와 검증시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', [`diaryUser=${diaryId}`]);
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(HistoryGetListDto, resultJson);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
      expect(result.statusCode).toBe(200);
    });
  });

  describe('(GET) /history/:historyId - 히스토리 아이템 보기', () => {
    let diaryId: string, historyItemId: string, token: string;

    beforeEach(async () => {
      ({ diaryId, token } = await createDiaryWithAnswer(app, diaryData));
      ({ diaryId } = await createDiaryWithAnswer(app, diaryData, diaryId));
      const historyResult = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', [`diaryUser=${diaryId}`]);
      historyItemId = historyResult.body.historyList[0]._id;
    });

    it('cookie가 없을 경우 400을 반환한다.', async () => {
      const result = await request(app.getHttpServer()).get(
        `/v1/history/${historyItemId}?take=5`,
      );

      expect(result.statusCode).toBe(400);
    });

    // it.each([
    //   { start: 10, take: 5, expected: 5 },
    //   { start: 0, take: 10, expected: 10 },
    // ])(
    //   'start = $start, take = $take일 때 answerList의 길이는 $expected여야 한다.',
    //   async ({ start, take, expected }) => {
    //     const promises = Array.from({ length: 20 }, (_, i) => {
    //       return request(app.getHttpServer())
    //         .post(`/v1/diary/answer/${diaryId}`)
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //           answers: ['yoyoo', '7', 'food', 'hobby', 'nodejs'],
    //           answerer: `client${i + 1}`,
    //         });
    //     });
    //     await Promise.all(promises);
    //     const result = await request(app.getHttpServer()).get(
    //       `/v1/diary/answerers/${diaryId}?start=${start}&take=${take}`,
    //     );
    //
    //     expect(result.statusCode).toBe(200);
    //     expect(result.body.answererList.length).toBe(expected);
    //   },
    // );

    it('response는 HistoryItemGetDto와 검증시 에러가 없어야 한다.', async () => {
      const result = await request(app.getHttpServer())
        .get(`/v1/history/${historyItemId}?take=5`)
        .set('Cookie', [`diaryUser=${diaryId}`]);
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(HistoryItemGetDto, resultJson);
      const errors = await validate(dtoObject);

      expect(errors.length).toBe(0);
      expect(result.statusCode).toBe(200);
    });

    it('cookie가 존재할 경우 200을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', [`diaryUser=${diaryId}`]);
      expect(result.statusCode).toBe(200);
    });
  });
});
