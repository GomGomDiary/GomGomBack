import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

const clientId1_Answer = {
  answers: ['name', 12, 'food', 'hobby'],
  answerer: 'client1',
};

describe('DiaryController (e2e)', () => {
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
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/diary (POST)', () => {
    let diaryId, newBieResponse;

    beforeEach(async () => {
      /**
       * 해당 beforeEach 실행 시
       * question 1개를 만들게 됩됩니다.
       */
      newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });
      const cookie = newBieResponse.header['set-cookie'][0];
      diaryId = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    it('with no cookie', async () => {
      expect(newBieResponse.statusCode).toBe(201);
    });

    it('with cookie', async () => {
      const oldBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          question: ['New name', 'New age', 'New food', 'Nwe hobby'],
          questioner: 'New',
          challenge: 'New',
          countersign: 'New',
        });
      expect(oldBieResponse.statusCode).toBe(204);
      // 상태값?
    });
  });

  describe('/diary/answer/:diaryId (POST)', () => {
    let diaryId, clientId1, answererResponse;

    beforeEach(async () => {
      /**
       * 해당 beforeEach 실행 시
       * question 1개, answer 1개를 만들게 됩니다.
       */
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });
      const diaryIdCookie = newBieResponse.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      answererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });

      const clientCookie = answererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = clientCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    it('with no cookie', async () => {
      expect(answererResponse.statusCode).toBe(201);
    });

    it('with cookie when duplication answer', async () => {
      const makeDuplicationAnswer = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${clientId1}`])
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });
      expect(makeDuplicationAnswer.statusCode).toBe(409);
    });

    it('with cookie when answer oneself', async () => {
      const selfResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });
      expect(selfResponse.statusCode).toBe(400);
    });
  });

  describe('/diary/answerers/:diaryId (GET)', () => {
    let diaryId, clientId1, clientId2;

    beforeEach(async () => {
      /**
       * 해당 beforeEach 실행 시
       * question 1개에 answer 2개가 붙어있는 구조를 갖게 됩니다.
       */
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });
      const diaryIdCookie = newBieResponse.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      const firstAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });

      const clientCookie = firstAnswererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = clientCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      const secondAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client2',
        });

      const cookie = secondAnswererResponse.header['set-cookie'][0];
      clientId2 = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    describe('with no cookie', () => {
      let result, resultJson;

      beforeEach(async () => {
        result = await request(app.getHttpServer()).get(
          `/diary/answerers/${diaryId}`,
        );
        resultJson = JSON.parse(result.text);
      });

      it('statusCode must be 200', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answererList.length must be 2', () => {
        expect(resultJson.answererList.length).toBe(2);
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('answererList[i]._id must be clientId', () => {
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('anwererList[i].isPermission must be false', () => {
        expect(resultJson.answererList[0].isPermission).toBeFalsy();
        expect(resultJson.answererList[1].isPermission).toBeFalsy();
      });
    });

    describe('with clientId1 cookie', () => {
      let result, resultJson;

      beforeEach(async () => {
        result = await request(app.getHttpServer())
          .get(`/diary/answerers/${diaryId}`)
          .set('Cookie', [`diaryUser=${clientId1}`]);
        resultJson = JSON.parse(result.text);
      });

      it('statusCode must be 200', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answererList.length must be 2', () => {
        expect(resultJson.answererList.length).toBe(2);
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('answererList[i]._id must be clientId', () => {
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('anwererList[0].isPermission must be true', () => {
        expect(resultJson.answererList[0].isPermission).toBeTruthy();
      });

      it('anwererList[1].isPermission must be false', () => {
        expect(resultJson.answererList[1].isPermission).toBeFalsy();
      });
    });

    describe('with diaryId cookie', () => {
      let result, resultJson;

      beforeEach(async () => {
        result = await request(app.getHttpServer())
          .get(`/diary/answerers/${diaryId}`)
          .set('Cookie', [`diaryUser=${diaryId}`]);
        resultJson = JSON.parse(result.text);
      });

      it('statusCode must be 200', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answererList.length must be 2', () => {
        expect(resultJson.answererList.length).toBe(2);
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('answererList[i]._id must be clientId', () => {
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('anwererList[0].isPermission must be true', () => {
        expect(resultJson.answererList[0].isPermission).toBeTruthy();
      });

      it('anwererList[1].isPermission must be true', () => {
        expect(resultJson.answererList[1].isPermission).toBeTruthy();
      });
    });
  });

  describe('/diary/answer/:diaryId/:answerId (GET)', () => {
    let diaryId, clientId1, clientId2;

    beforeEach(async () => {
      /**
       * 해당 beforeEach 실행 시
       * question 1개에 answer 2개가 붙어있는 구조를 갖게 됩니다.
       */
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });
      const diaryIdCookie = newBieResponse.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      const firstAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });

      const clientCookie = firstAnswererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = clientCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      const secondAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client2',
        });

      const cookie = secondAnswererResponse.header['set-cookie'][0];
      clientId2 = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    describe('with no cookie', () => {
      let result;

      beforeEach(async () => {
        result = await request(app.getHttpServer()).get(
          `/diary/answer/${diaryId}/${clientId1}`,
        );
      });
      it('statusCode must be 400', async () => {
        expect(result.statusCode).toBe(400);
      });
    });

    describe('with diaryId cookie', () => {
      let result, resultJson;

      beforeEach(async () => {
        result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${diaryId}`]);
        resultJson = JSON.parse(result.text);
      });

      it('statusCode must be 200', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answerList _id must be clientId1', () => {
        expect(resultJson.answerList[0]._id).toEqual(clientId1);
      });
    });

    describe('with clientId cookie that has no permission', () => {
      let result;

      beforeEach(async () => {
        result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${clientId2}`]);
      });

      it('statusCode must be 200', async () => {
        expect(result.statusCode).toBe(400);
      });
    });

    describe('with clientId cookie that has permission', () => {
      let result, resultJson;

      beforeEach(async () => {
        result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${clientId1}`]);
        resultJson = JSON.parse(result.text);
      });

      it('statusCode must be 200', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answerList _id must be clientId1', () => {
        expect(resultJson.answerList[0]._id).toEqual(clientId1);
      });

      it('answerList answers must be answers of clientId1 answer', () => {
        expect(resultJson.answerList[0].answers).toStrictEqual(
          clientId1_Answer.answers,
        );
      });
    });
  });
});
