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

  describe('/diary', () => {
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

    it('ownership을 검증한다.', async () => {
      const result = await request(app.getHttpServer())
        .get('/diary')
        .set('Cookie', [`diaryUser=${diaryId}`]);
      expect(result.statusCode).toBe(200);
      expect(result.text).toEqual('true');
    });

    it('cookie가 없는 경우 201을 반환한다.', async () => {
      expect(newBieResponse.statusCode).toBe(201);
    });

    it('cookie가 있는 경우 204를 반환한다.', async () => {
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

  describe('/diary/answer/:diaryId', () => {
    let diaryId, clientId1, answererResponse, token;

    beforeEach(async () => {
      /**
       * 개요
       * 해당 beforeEach 실행 시
       * question 1개, answer 1개를 만들게 됩니다.
       */

      /**
       * question 생성
       */
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });

      /**
       * diaryId cookie 파싱
       */
      const diaryIdCookie = newBieResponse.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      /**
       * answerer 인증
       */
      const tokenResponse = await request(app.getHttpServer())
        .post(`/diary/countersign/${diaryId}`)
        .send({
          countersign: 'first',
        });

      /**
       * token 파싱
       */
      token = tokenResponse.body.diaryToken;

      /**
       * answer 생성 with token
       */
      answererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);

      /**
       * answererId cookie 파싱
       */
      const clientCookie = answererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = clientCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    it('cookie가 없는 경우 201을 반환한다.', async () => {
      expect(answererResponse.statusCode).toBe(201);
    });

    it('중복 답변의 경우 409를 반환한다.', async () => {
      const makeDuplicationAnswer = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${clientId1}`])
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);
      expect(makeDuplicationAnswer.statusCode).toBe(409);
    });

    it('스스로에게 답변한 경우 400을 반환한다.', async () => {
      const selfResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${diaryId}`])
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);
      expect(selfResponse.statusCode).toBe(400);
    });
  });

  describe('/diary/answerers/:diaryId', () => {
    let diaryId, clientId1, clientId2, token;

    beforeEach(async () => {
      /**
       * 개요
       * 해당 beforeEach 실행 시
       * question 1개에 answer 2개가 붙어있는 구조를 갖게 됩니다.
       */

      /**
       * question 생성
       */
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });

      /**
       * diaryId 파싱
       */
      const diaryIdCookie = newBieResponse.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      /**
       * answerer 인증
       */
      const tokenResponse = await request(app.getHttpServer())
        .post(`/diary/countersign/${diaryId}`)
        .send({
          countersign: 'first',
        });

      /**
       * token 파싱
       */
      token = tokenResponse.body.diaryToken;

      /**
       * answer1 생성
       */
      const firstAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);

      /**
       * cookie 파싱
       */
      const clientCookie = firstAnswererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = clientCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      /**
       * answer2 생성
       */
      const secondAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client2',
        });

      /**
       * cookie 파싱
       */
      const cookie = secondAnswererResponse.header['set-cookie'][0];
      clientId2 = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    describe('with no cookie', () => {
      let result, resultJson;

      beforeEach(async () => {
        /**
         * answerer 정보 요청
         */
        result = await request(app.getHttpServer()).get(
          `/diary/answerers/${diaryId}`,
        );
        resultJson = JSON.parse(result.text);
      });

      it('200을 반환한다.', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('response에 questioner가 존재해야한다.', () => {
        expect(resultJson.questioner).toBeDefined();
      });

      it('answerList의 길이는 2여야한다.', () => {
        expect(resultJson.answererList.length).toBe(2);
      });

      it('answererList[i]._id는 clientId${i}여야 한다.', () => {
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('anwererList[i].isPermission은 false여야 한다.', () => {
        expect(resultJson.answererList[0].isPermission).toBe(false);
        expect(resultJson.answererList[1].isPermission).toBe(false);
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

      it('200을 반환한다.', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answererList의 길이는 2여야 한다.', () => {
        expect(resultJson.answererList.length).toBe(2);
      });

      it('answererList[i]._id는 clientId${i}여야 한다.', () => {
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('anwererList[0].isPermission은 true여야 한다.', () => {
        expect(resultJson.answererList[0].isPermission).toBeTruthy();
      });

      it('anwererList[1].isPermission은 false여야 한다', () => {
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

      it('200을 반환한다.', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answererList의 길이는 2여야 한다.', () => {
        expect(resultJson.answererList.length).toBe(2);
      });

      it('answererList[i]._id는 clientId${i}여야 한다.', () => {
        expect(resultJson.answererList[0]._id).toEqual(clientId1);
        expect(resultJson.answererList[1]._id).toEqual(clientId2);
      });

      it('anwererList[0].isPermission은 true여야 한다.', () => {
        expect(resultJson.answererList[0].isPermission).toBeTruthy();
      });

      it('anwererList[1].isPermission은 true여야 한다.', () => {
        expect(resultJson.answererList[1].isPermission).toBeTruthy();
      });
    });
  });

  describe('/diary/answer/:diaryId/:answerId (GET)', () => {
    let diaryId, clientId1, clientId2, token;

    beforeEach(async () => {
      /**
       * 개요
       * 해당 beforeEach 실행 시
       * question 1개에 answer 2개가 붙어있는 구조를 갖게 됩니다.
       */

      /**
       * question 생성
       */
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });

      /**
       * diaryId 파싱
       */
      const diaryIdCookie = newBieResponse.header['set-cookie'][0];
      diaryId = diaryIdCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      /**
       * answerer 인증
       */
      const tokenResponse = await request(app.getHttpServer())
        .post(`/diary/countersign/${diaryId}`)
        .send({
          countersign: 'first',
        });

      /**
       * token 파싱
       */
      token = tokenResponse.body.diaryToken;

      /**
       * answer1 생성
       */
      const firstAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(clientId1_Answer);

      /**
       * cookie 파싱
       */
      const clientCookie = firstAnswererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = clientCookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');

      /**
       * answer2 생성
       */
      const secondAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client2',
        });

      /**
       * cookie 파싱
       */
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
      it('400을 반환한다.', async () => {
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

      it('200을 반환한다.', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answerList _id는 clientId1과 같아야한다.', () => {
        expect(resultJson.answer._id).toEqual(clientId1);
      });
    });

    describe('with clientId cookie that has no permission', () => {
      let result;

      beforeEach(async () => {
        result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${clientId2}`]);
      });

      it('200을 반환한다.', async () => {
        expect(result.statusCode).toBe(401);
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

      it('200을 반환한다.', async () => {
        expect(result.statusCode).toBe(200);
      });

      it('answer _id는 clientId1이어야 한다.', () => {
        expect(resultJson.answer._id).toEqual(clientId1);
      });

      it('answers는 clientId1 answer과 같아야 한다.', () => {
        expect(resultJson.answer.answers).toStrictEqual(
          clientId1_Answer.answers,
        );
      });
    });
  });
});
