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

  let diaryId;

  describe('/diary (POST)', () => {
    it('with no cookie', async () => {
      const newBieResponse = await request(app.getHttpServer())
        .post('/diary/question')
        .send({
          question: ['name', 'age', 'food', 'hobby'],
          questioner: 'first',
          challenge: 'first',
          countersign: 'first',
        });
      expect(newBieResponse.statusCode).toBe(201);

      const cookie = newBieResponse.header['set-cookie'][0];
      diaryId = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
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
    });
  });

  let clientId1, clientId2;

  describe('/diary/answer/:diaryId (POST)', () => {
    it('with no cookie (make clientId1)', async () => {
      const firstAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });

      expect(firstAnswererResponse.statusCode).toBe(201);
      const cookie = firstAnswererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId1 = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });

    it('with cookie when duplication answer', async () => {
      const duplicationResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${clientId1}`])
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });
      expect(duplicationResponse.statusCode).toBe(409);
    });

    it('with cookie when answer oneself', async () => {
      const duplicationResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client1',
        });
      expect(duplicationResponse.statusCode).toBe(400);
    });

    it('with no cookie (make clientId2)', async () => {
      const secondAnswererResponse = await request(app.getHttpServer())
        .post(`/diary/answer/${diaryId}`)
        .send({
          answers: ['name', 12, 'food', 'hobby'],
          answerer: 'client2',
        });

      expect(secondAnswererResponse.statusCode).toBe(201);
      const cookie = secondAnswererResponse.header['set-cookie'][0];
      // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
      clientId2 = cookie
        .match(/diaryUser=.+?;/)[0]
        .slice('diaryUser='.length)
        .replace(/;/g, '');
    });
  });

  describe('/diary/answerers/:diaryId (GET)', () => {
    let resultJson;

    describe('with no cookie', () => {
      it('statusCode must be 200', async () => {
        const result = await request(app.getHttpServer()).get(
          `/diary/answerers/${diaryId}`,
        );
        resultJson = JSON.parse(result.text);
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
      it('statusCode must be 200', async () => {
        const result = await request(app.getHttpServer())
          .get(`/diary/answerers/${diaryId}`)
          .set('Cookie', [`diaryUser=${clientId1}`]);
        resultJson = JSON.parse(result.text);
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
      it('statusCode must be 200', async () => {
        const result = await request(app.getHttpServer())
          .get(`/diary/answerers/${diaryId}`)
          .set('Cookie', [`diaryUser=${diaryId}`]);
        resultJson = JSON.parse(result.text);
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
    describe('with no cookie', () => {
      it('statusCode must be 400', async () => {
        const result = await request(app.getHttpServer()).get(
          `/diary/answer/${diaryId}/${clientId1}`,
        );
        expect(result.statusCode).toBe(400);
      });
    });

    describe('with diaryId cookie', () => {
      let resultJson;
      it('statusCode must be 200', async () => {
        const result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${diaryId}`]);
        expect(result.statusCode).toBe(200);
        resultJson = JSON.parse(result.text);
      });

      it('answerList _id must be clientId1', () => {
        expect(resultJson.answerList[0]._id).toEqual(clientId1);
      });
    });

    describe('with clientId cookie that has no permission', () => {
      it('statusCode must be 200', async () => {
        const result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${clientId2}`]);
        expect(result.statusCode).toBe(400);
      });
    });

    describe('with clientId cookie that has permission', () => {
      let resultJson;
      it('statusCode must be 200', async () => {
        const result = await request(app.getHttpServer())
          .get(`/diary/answer/${diaryId}/${clientId1}`)
          .set('Cookie', [`diaryUser=${clientId1}`]);
        resultJson = JSON.parse(result.text);
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
