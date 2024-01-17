import { Test, TestingModule } from '@nestjs/testing';
import { DiaryService } from './diary.service';
import { DiaryRepository } from '../common/repositories/diary.repository';
import httpMocks from 'node-mocks-http';
import { CacheRepository } from '../common/repositories/cache.repository';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Diary } from 'src/models/diary.schema';
import mongoose, { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { History } from 'src/models/history.schema';
import { CreateAnswerDto } from 'src/common/dtos/request/answer.post.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateDiaryDto } from 'src/common/dtos/request/diary.post.dto';

describe('DiaryService', () => {
  let diaryService: DiaryService;
  let cacheRepository: CacheRepository;
  let diaryRepository: DiaryRepository;
  let connection: mongoose.Connection;
  let historyModel: Model<History>;
  // let diaryModel: Model<Diary>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryService,
        DiaryRepository,
        ConfigService,
        CacheRepository,
        {
          provide: getModelToken(Diary.name),
          useValue: {},
        },
        {
          provide: getModelToken(History.name),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {},
        },
        {
          provide: getConnectionToken('Database'),
          useValue: {
            startSession: jest.fn(() => ({
              withTransaction: jest
                .fn()
                .mockImplementation((callback) => callback()),
              endSession: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    diaryService = module.get<DiaryService>(DiaryService);
    historyModel = module.get<Model<History>>(getModelToken(History.name));
    diaryRepository = module.get<DiaryRepository>(DiaryRepository);
    cacheRepository = module.get(CacheRepository);
    connection = module.get<mongoose.Connection>(
      getConnectionToken('Database'),
    );
    // diaryModel = module.get<Model<Diary>>(getModelToken(Diary.name));
  });

  it('should be defined', () => {
    expect(diaryService).toBeDefined();
  });

  describe('postQuestion', () => {
    describe('Diary Owner일 때', () => {
      it('204 status code를 반환한다.', async () => {
        const body: CreateDiaryDto = {
          question: [],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const clientId = new Types.ObjectId().toString();
        const res = httpMocks.createResponse();
        const diary: Diary = {
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          question: [],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
          answerList: [],
        };
        diaryRepository.checkOwnership = jest
          .fn()
          .mockResolvedValue(Promise.resolve(true));
        diaryRepository.findOne = jest
          .fn()
          .mockResolvedValue(Promise.resolve(diary));
        diaryRepository.updateOne = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        cacheRepository.keys = jest
          .fn()
          .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
        cacheRepository.del = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));

        await diaryService.postQuestion({ body, clientId, res });

        expect(res.statusCode).toBe(204);
      });

      it('create 메서드를 한 번 호출한다', async () => {
        const body: CreateDiaryDto = {
          question: [],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const clientId = new Types.ObjectId().toString();
        const res = httpMocks.createResponse();
        const diary: Diary = {
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          question: [],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
          answerList: [],
        };
        diaryRepository.checkOwnership = jest
          .fn()
          .mockResolvedValue(Promise.resolve(true));
        diaryRepository.findOne = jest
          .fn()
          .mockResolvedValue(Promise.resolve(diary));
        diaryRepository.updateOne = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        cacheRepository.keys = jest
          .fn()
          .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
        cacheRepository.del = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        jest.spyOn(historyModel, 'create');

        await diaryService.postQuestion({ body, clientId, res });

        expect(historyModel.create).toBeCalledTimes(1);
      });

      it('cache del를 한 번 호출한다.', async () => {
        const body: CreateDiaryDto = {
          question: [],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const clientId = new Types.ObjectId().toString();
        const res = httpMocks.createResponse();
        const diary: Diary = {
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          question: [],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
          answerList: [],
        };
        diaryRepository.checkOwnership = jest
          .fn()
          .mockResolvedValue(Promise.resolve(true));
        diaryRepository.findOne = jest
          .fn()
          .mockResolvedValue(Promise.resolve(diary));
        diaryRepository.updateOne = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        cacheRepository.keys = jest
          .fn()
          .mockResolvedValue(Promise.resolve([`/v1/diary/${clientId}`]));
        cacheRepository.del = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));

        await diaryService.postQuestion({ body, clientId, res });

        expect(cacheRepository.del).toBeCalledTimes(1);
      });
    });

    describe('Answerer일 때', () => {
      it('createWithId 메서드를 1번 호출한다.', async () => {
        const body: CreateDiaryDto = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const clientId = new Types.ObjectId().toString();
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership = jest
          .fn()
          .mockResolvedValue(Promise.resolve(false));
        diaryRepository.existAsAnswerer = jest
          .fn()
          .mockResolvedValue(Promise.resolve(true));
        cacheRepository.keys = jest
          .fn()
          .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
        cacheRepository.del = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        jest.spyOn(diaryRepository, 'createWithId').mockResolvedValue(void 0);

        await diaryService.postQuestion({
          body,
          clientId,
          res,
        });

        expect(diaryRepository.createWithId).toBeCalledTimes(1);
      });
    });

    describe('Newbie일 때', () => {
      it('create 메서드를 호출한다.', async () => {
        const body: CreateDiaryDto = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const clientId = new Types.ObjectId().toString();
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership = jest
          .fn()
          .mockResolvedValue(Promise.resolve(false));
        diaryRepository.existAsAnswerer = jest
          .fn()
          .mockResolvedValue(Promise.resolve(false));
        cacheRepository.keys = jest
          .fn()
          .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
        cacheRepository.del = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        jest
          .spyOn(diaryRepository, 'create')
          .mockResolvedValue({ _id: new Types.ObjectId() });

        await diaryService.postQuestion({ body, clientId, res });

        expect(diaryRepository.create).toBeCalledTimes(1);
      });

      it('cookie를 심는지 검증한다.', async () => {
        const body: CreateDiaryDto = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const clientId = new Types.ObjectId().toString();
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership = jest
          .fn()
          .mockResolvedValue(Promise.resolve(false));
        diaryRepository.existAsAnswerer = jest
          .fn()
          .mockResolvedValue(Promise.resolve(false));
        cacheRepository.keys = jest
          .fn()
          .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
        cacheRepository.del = jest
          .fn()
          .mockResolvedValue(Promise.resolve(void 0));
        diaryRepository.create = jest
          .fn()
          .mockResolvedValue({ _id: new Types.ObjectId() });
        jest.spyOn(res, 'cookie');

        await diaryService.postQuestion({ body, clientId, res });

        expect(res.cookie).toHaveBeenCalled();
      });
    });
  });

  describe('postAnswer', () => {
    it('자신의 다이어리에 답장한다면 BadRequestException을 throw한다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const clientId = diaryId;
      const answer: CreateAnswerDto = {
        answerer: 'answerer',
        answers: ['1', '2'],
      };
      const res = httpMocks.createResponse();

      const postAnswer = diaryService.postAnswer({
        diaryId,
        clientId,
        answer,
        res,
      });

      await expect(postAnswer).rejects.toBeInstanceOf(BadRequestException);
    });

    it('이미 답변을 작성했다면 ConflictException을 throw한다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const clientId = new Types.ObjectId().toString();
      const answer: CreateAnswerDto = {
        answerer: 'answerer',
        answers: ['1', '2'],
      };
      const res = httpMocks.createResponse();
      jest
        .spyOn(diaryRepository, 'checkDuplication')
        .mockResolvedValue(Promise.resolve(true));

      const postAnswer = diaryService.postAnswer({
        diaryId,
        clientId,
        answer,
        res,
      });

      await expect(postAnswer).rejects.toBeInstanceOf(ConflictException);
    });

    it('question 배열과 answers 배열이 다르다면 BadRequestException을 throw한다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const clientId = new Types.ObjectId().toString();
      const answer: CreateAnswerDto = {
        answerer: 'answerer',
        answers: ['1', '2', '3'],
      };
      const res = httpMocks.createResponse();
      const returnedDiaryByFindById: Diary = {
        _id: new Types.ObjectId(diaryId),
        question: ['1', '2'],
        challenge: 'challenge',
        countersign: 'countersign',
        questioner: 'questioner',
        createdAt: new Date(),
        updatedAt: new Date(),
        answerList: [],
      };
      diaryRepository.checkDuplication = jest
        .fn()
        .mockResolvedValue(Promise.resolve(false));
      diaryRepository.findById = jest
        .fn()
        .mockResolvedValueOnce(Promise.resolve(returnedDiaryByFindById));

      const postAnswer = diaryService.postAnswer({
        diaryId,
        clientId,
        answer,
        res,
      });

      await expect(postAnswer).rejects.toBeInstanceOf(BadRequestException);
    });

    it('clientId가 존재하지 않으면 res.cookie를 두 번 호출한다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const clientId = undefined;
      const answer: CreateAnswerDto = {
        answerer: 'answerer',
        answers: ['1', '2'],
      };
      const res = httpMocks.createResponse();
      const returnedDiaryByFindById: Diary = {
        _id: new Types.ObjectId(diaryId),
        question: ['1', '2'],
        challenge: 'challenge',
        countersign: 'countersign',
        questioner: 'questioner',
        createdAt: new Date(),
        updatedAt: new Date(),
        answerList: [],
      };
      diaryRepository.checkDuplication = jest
        .fn()
        .mockResolvedValue(Promise.resolve(false));
      diaryRepository.findById = jest
        .fn()
        .mockResolvedValueOnce(Promise.resolve(returnedDiaryByFindById));

      cacheRepository.keys = jest
        .fn()
        .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
      cacheRepository.del = jest
        .fn()
        .mockResolvedValue(Promise.resolve(void 0));
      diaryRepository.save = jest.fn();
      jest.spyOn(res, 'cookie');

      await diaryService.postAnswer({
        diaryId,
        clientId,
        answer,
        res,
      });

      expect(res.cookie).toBeCalledTimes(2);
    });

    it('clientId가 존재하면 res.cookie를 호출하지 않는다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const clientId = new Types.ObjectId().toString();
      const answer: CreateAnswerDto = {
        answerer: 'answerer',
        answers: ['1', '2'],
      };
      const res = httpMocks.createResponse();
      const returnedDiaryByFindById: Diary = {
        _id: new Types.ObjectId(diaryId),
        question: ['1', '2'],
        challenge: 'challenge',
        countersign: 'countersign',
        questioner: 'questioner',
        createdAt: new Date(),
        updatedAt: new Date(),
        answerList: [],
      };
      diaryRepository.checkDuplication = jest
        .fn()
        .mockResolvedValue(Promise.resolve(false));
      diaryRepository.findById = jest
        .fn()
        .mockResolvedValueOnce(Promise.resolve(returnedDiaryByFindById));

      cacheRepository.keys = jest
        .fn()
        .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
      cacheRepository.del = jest
        .fn()
        .mockResolvedValue(Promise.resolve(void 0));
      diaryRepository.save = jest.fn();
      jest.spyOn(res, 'cookie');

      await diaryService.postAnswer({
        diaryId,
        clientId,
        answer,
        res,
      });

      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('save 메서드를 호출한다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const clientId = new Types.ObjectId().toString();
      const answer: CreateAnswerDto = {
        answerer: 'answerer',
        answers: ['1', '2'],
      };
      const res = httpMocks.createResponse();
      const returnedDiaryByFindById: Diary = {
        _id: new Types.ObjectId(diaryId),
        question: ['1', '2'],
        challenge: 'challenge',
        countersign: 'countersign',
        questioner: 'questioner',
        createdAt: new Date(),
        updatedAt: new Date(),
        answerList: [],
      };
      diaryRepository.checkDuplication = jest
        .fn()
        .mockResolvedValue(Promise.resolve(false));
      diaryRepository.findById = jest
        .fn()
        .mockResolvedValueOnce(Promise.resolve(returnedDiaryByFindById));
      cacheRepository.keys = jest
        .fn()
        .mockResolvedValue(Promise.resolve(['/v1/diary/1234']));
      cacheRepository.del = jest
        .fn()
        .mockResolvedValue(Promise.resolve(void 0));
      jest.spyOn(diaryRepository, 'save').mockResolvedValue(void 0);

      await diaryService.postAnswer({
        diaryId,
        clientId,
        answer,
        res,
      });

      expect(diaryRepository.save).toBeCalledTimes(1);
    });
  });
});
