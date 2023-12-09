import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setUp } from 'src/utils/setUp';
import { createDiary } from './utils/createDiary';
import { diaryData } from './utils/constants';

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

  describe('(GET) /history - 히스토리 리스트', () => {
    let diaryId: string, newbieResponse: request.Response;

    beforeEach(async () => {
      newbieResponse = await createDiary(app, diaryData);
      const cookie = newbieResponse.header['set-cookie'][0];

      diaryId = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
      createDiary(app, diaryData, diaryId);
    });

    it('cookie가 없을 경우 400을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', []);
      expect(result.statusCode).toBe(400);
    });

    it('cookie가 존재할 경우 200을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', [`diaryUser=${diaryId}`]);
      expect(result.statusCode).toBe(200);
    });
  });

  describe('(GET) /history', () => {
    let diaryId: string, newbieResponse: request.Response;

    beforeEach(async () => {
      newbieResponse = await createDiary(app, diaryData);
      const cookie = newbieResponse.header['set-cookie'][0];

      diaryId = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
      createDiary(app, diaryData, diaryId);
    });

    it('cookie가 없을 경우 400을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', []);
      expect(result.statusCode).toBe(400);
    });

    it('cookie가 존재할 경우 200을 반환한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/v1/history?take=5')
        .set('Cookie', [`diaryUser=${diaryId}`]);
      expect(result.statusCode).toBe(200);
    });
  });
});
