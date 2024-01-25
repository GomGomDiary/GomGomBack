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
import { validate } from 'class-validator';
import mongoose from 'mongoose';
import { ChatTokenShowDto } from 'src/common/dtos/response/chat.token.res.dto';
import { ChatRoomPostDto } from 'src/common/dtos/response/chatRoom.post.dto';
import { CreateMessageDto } from 'src/common/dtos/response/chatMessage.post.dto';
import { MessageGetListDto } from 'src/common/dtos/response/message.get.dto';

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

  describe('(POST) /chat - 채팅방 생성', () => {
    it('이미 존재할 경우 409을 반환한다.', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });

      const duplicationResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });

      expect(duplicationResult.statusCode).toBe(409);
    });

    it('다이어리 주인이 아닐 경우 403을 반환한다.', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );

      const forbiddenResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${clientId1}`])
        .send({
          answererId: diaryId,
        });

      expect(forbiddenResult.statusCode).toBe(403);
    });

    it('answerer가 답장한 사람이 아닐 경우 403을 반환한다.', async () => {
      const { diaryId } = await createDiaryWithAnswer(app, diaryData);

      const forbiddenResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: new mongoose.Types.ObjectId(),
        });

      expect(forbiddenResult.statusCode).toBe(403);
    });

    it('다이어리에는 roomId가 존재해야 한다.', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      const chatResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const chatId = chatResult.body._id;

      // answererResult에서 clientId1의 _id를 가진 응답 값은 chatId라는 값을 가져야 한다.
      const answererResult = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}?start=0&take=5&sortOrder=desc`,
      );
      const targetAnswerer = answererResult.body.answererList.find(
        (answerer: any) => answerer._id === clientId1,
      );

      expect(targetAnswerer.roomId).toBe(chatId);
    });

    it('caching이 적용되어 있을 때, roomId가 조회되어야 한다.', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      // caching처리를 위한 요청
      await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}?start=0&take=5&sortOrder=desc`,
      );

      const chatResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const chatId = chatResult.body._id;

      // answererResult에서 clientId1의 _id를 가진 응답 값은 chatId라는 값을 가져야 한다.
      const answererResult = await request(app.getHttpServer()).get(
        `/v1/diary/answerers/${diaryId}?start=0&take=5&sortOrder=desc`,
      );
      const targetAnswerer = answererResult.body.answererList.find(
        (answerer: any) => answerer._id === clientId1,
      );

      expect(targetAnswerer.roomId).toBe(chatId);
    });

    it('response는 ChatRoomPostDto와 검증시 에러가 없어야 한다', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      const result = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(ChatRoomPostDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(201);
      expect(errors.length).toBe(0);
    });
  });

  describe('(POST) /chat/token - 토큰 생성', () => {
    it('response는 ChatTokenShowDto와 검증시 에러가 없어야 한다', async () => {
      const { diaryId } = await createDiaryWithAnswer(app, diaryData);
      const result = await request(app.getHttpServer())
        .post('/v1/chat/token')
        .set('Cookie', [`diaryUser=${diaryId}`]);

      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(ChatTokenShowDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(201);
      expect(errors.length).toBe(0);
    });
  });

  describe('(POST) /chat/message - 메세지 생성', () => {
    it('채팅방이 없을 경우 403을 반환한다.', async () => {
      const { diaryId, clientId1, clientId2 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      // diaryId - clientId1 채팅방 생성
      const chatResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const roomId = chatResult.body._id;

      // clientId2가 diaryId - clientId1 채팅방에 메세지 전송
      const forbiddenResult = await request(app.getHttpServer())
        .post('/v1/chat/message')
        .set('Cookie', [`diaryUser=${clientId2}`])
        .send({
          roomId,
          nickname: 'nickname',
          chat: 'chat',
        });

      expect(forbiddenResult.statusCode).toBe(403);
    });

    it('response는 CreateMessageDto와 validation시 에러가 없어야 한다', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      // diaryId - clientId1 채팅방 생성
      const chatResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const roomId = chatResult.body._id;

      // clientId2가 diaryId - clientId1 채팅방에 메세지 전송
      const result = await request(app.getHttpServer())
        .post('/v1/chat/message')
        .set('Cookie', [`diaryUser=${clientId1}`])
        .send({
          roomId,
          nickname: 'nickname',
          chat: 'chat',
        });

      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(CreateMessageDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(201);
      expect(errors.length).toBe(0);
    });
  });

  describe('(GET) /chat/message/:roomId - 메세지 리스트 가져오기', () => {
    it('채팅방이 없을 경우 403을 반환한다.', async () => {
      const randomRoomId = new mongoose.Types.ObjectId();
      const randomDiaryId = new mongoose.Types.ObjectId();

      const forbiddenResult = await request(app.getHttpServer())
        .get(`/v1/chat/message/${randomRoomId}?take=5`)
        .set('Cookie', [`diaryUser=${randomDiaryId}`]);

      expect(forbiddenResult.statusCode).toBe(403);
    });

    it('_id  역순으로 정렬되어야 한다.', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      // diaryId - clientId1 채팅방 생성
      const chatResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const roomId = chatResult.body._id;
      // client 메세지 생성
      const clientMessagePromises = Array.from({ length: 20 }, (_, i) => {
        return request(app.getHttpServer())
          .post('/v1/chat/message')
          .set('Cookie', [`diaryUser=${clientId1}`])
          .send({
            roomId,
            nickname: 'answerer',
            chat: 'chat from answerer',
          });
      });
      // owner 메세지 생성
      const diaryOwnerMessagePromises = Array.from({ length: 20 }, (_, i) => {
        return request(app.getHttpServer())
          .post('/v1/chat/message')
          .set('Cookie', [`diaryUser=${diaryId}`])
          .send({
            roomId,
            nickname: 'diaryOwner',
            chat: 'chat from diaryOwner',
          });
      });
      await Promise.all([
        ...clientMessagePromises,
        ...diaryOwnerMessagePromises,
      ]);

      const result = await request(app.getHttpServer())
        .get(`/v1/chat/message/${roomId}?take=5`)
        .set('Cookie', [`diaryUser=${diaryId}`]);

      const { messageList, next } = result.body;
      for (let i = 0; i < messageList.length - 1; i++) {
        expect(messageList[i]._id > messageList[i + 1]._id).toBe(true);
      }
      expect(next).toBeDefined();
    });

    it.each([{ take: 5 }, { take: 10 }])(
      'messageList는 $take개를 가져오며 _id 역순 정렬되어야 한다',
      async ({ take }) => {
        const { diaryId, clientId1 } = await createDiaryWithAnswer(
          app,
          diaryData,
        );
        // diaryId - clientId1 채팅방 생성
        const chatResult = await request(app.getHttpServer())
          .post('/v1/chat')
          .set('Cookie', [`diaryUser=${diaryId}`])
          .send({
            answererId: clientId1,
          });
        const roomId = chatResult.body._id;
        // client 메세지 생성
        const clientMessagePromises = Array.from({ length: 20 }, (_, i) => {
          return request(app.getHttpServer())
            .post('/v1/chat/message')
            .set('Cookie', [`diaryUser=${clientId1}`])
            .send({
              roomId,
              nickname: 'answerer',
              chat: 'chat from answerer',
            });
        });
        // owner 메세지 생성
        const diaryOwnerMessagePromises = Array.from({ length: 20 }, (_, i) => {
          return request(app.getHttpServer())
            .post('/v1/chat/message')
            .set('Cookie', [`diaryUser=${diaryId}`])
            .send({
              roomId,
              nickname: 'diaryOwner',
              chat: 'chat from diaryOwner',
            });
        });
        await Promise.all([
          ...clientMessagePromises,
          ...diaryOwnerMessagePromises,
        ]);

        const result = await request(app.getHttpServer())
          .get(`/v1/chat/message/${roomId}?take=${take}`)
          .set('Cookie', [`diaryUser=${diaryId}`]);

        const { messageList, next } = result.body;
        for (let i = 0; i < messageList.length - 1; i++) {
          expect(messageList[i]._id > messageList[i + 1]._id).toBe(true);
        }
        expect(next).toBeDefined();
        expect(messageList.length).toBe(take);
      },
    );

    it('response는 MessageGetListDto와 validation시 에러가 없어야한다 ', async () => {
      const { diaryId, clientId1 } = await createDiaryWithAnswer(
        app,
        diaryData,
      );
      // diaryId - clientId1 채팅방 생성
      const chatResult = await request(app.getHttpServer())
        .post('/v1/chat')
        .set('Cookie', [`diaryUser=${diaryId}`])
        .send({
          answererId: clientId1,
        });
      const roomId = chatResult.body._id;
      // client 메세지 생성
      const clientMessagePromises = Array.from({ length: 20 }, (_, i) => {
        return request(app.getHttpServer())
          .post('/v1/chat/message')
          .set('Cookie', [`diaryUser=${clientId1}`])
          .send({
            roomId,
            nickname: 'answerer',
            chat: 'chat from answerer',
          });
      });
      // owner 메세지 생성
      const diaryOwnerMessagePromises = Array.from({ length: 20 }, (_, i) => {
        return request(app.getHttpServer())
          .post('/v1/chat/message')
          .set('Cookie', [`diaryUser=${diaryId}`])
          .send({
            roomId,
            nickname: 'diaryOwner',
            chat: 'chat from diaryOwner',
          });
      });
      await Promise.all([
        ...clientMessagePromises,
        ...diaryOwnerMessagePromises,
      ]);

      const result = await request(app.getHttpServer())
        .get(`/v1/chat/message/${roomId}?take=5`)
        .set('Cookie', [`diaryUser=${diaryId}`]);
      const resultJson = JSON.parse(result.text);
      const dtoObject = plainToClass(MessageGetListDto, resultJson);
      const errors = await validate(dtoObject);

      expect(result.statusCode).toBe(200);
      expect(errors.length).toBe(0);
    });
  });
});
