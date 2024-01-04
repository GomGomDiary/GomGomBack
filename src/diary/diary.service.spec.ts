import { Test, TestingModule } from '@nestjs/testing';
import { DiaryService } from './diary.service';
import { DiaryRepository } from '../common/repositories/diary.repository';
import httpMocks from 'node-mocks-http';
import { CacheRepository } from '../common/repositories/cache.repository';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CreateAnswerDto } from 'src/common/dtos/answer.post.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('DiaryService', () => {
  let diaryService: DiaryService;
  let cacheService: DeepMocked<CacheRepository>;
  let diaryRepository: any;
  // let diaryRepository: DeepMocked<DiaryRepository>;

  const mockDiaryRepository = {
    findField: jest.fn(),
    checkOwnership: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest.fn(),
    existAsAnswerer: jest.fn(),
    createWithId: jest.fn(),
    create: jest.fn(),
    checkDuplication: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryService,
        {
          provide: DiaryRepository,
          useValue: mockDiaryRepository,
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    diaryService = module.get<DiaryService>(DiaryService);
    diaryRepository = module.get<DiaryRepository>(DiaryRepository);
    cacheService = module.get(CacheRepository);
  });

  it('should be defined', () => {
    expect(diaryService).toBeDefined();
  });

  describe('[postQuestion]', () => {
    describe('Diary Owner일 때', () => {
      it('updateOne 메서드를 호출한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(true);

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(diaryRepository.updateOne).toBeCalled();
      });

      it('204 status code를 반환한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(true);

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(res.statusCode).toBe(204);
      });

      it('cache del를 호출한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(true);
        cacheService.keys.mockResolvedValueOnce(['/v1/diary/1234']);

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(cacheService.del).toBeCalled();
      });
    });

    describe('Answerer일 때', () => {
      it('createWithId 메서드를 호출한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(false);
        diaryRepository.existAsAnswerer.mockResolvedValueOnce(true);

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(diaryRepository.createWithId).toBeCalled();
      });

      it('cache del를 호출한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(false);
        diaryRepository.existAsAnswerer.mockResolvedValueOnce(true);
        cacheService.keys.mockResolvedValueOnce(['/v1/diary/1234']);

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(cacheService.del).toBeCalled();
      });
    });
    describe('Newbie일 때', () => {
      it('create 메서드를 호출한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(false);
        diaryRepository.existAsAnswerer.mockResolvedValueOnce(false);
        diaryRepository.create.mockResolvedValueOnce({ _id: '1234' });

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(diaryRepository.create).toBeCalled();
      });

      it('cache del를 호출한다.', async () => {
        const body = {
          question: ['질문', '일까요?'],
          questioner: 'questioner',
          challenge: 'challenge',
          countersign: 'countersign',
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkOwnership.mockResolvedValueOnce(false);
        diaryRepository.existAsAnswerer.mockResolvedValueOnce(false);
        diaryRepository.create.mockResolvedValueOnce({ _id: '1234' });
        cacheService.keys.mockResolvedValueOnce(['/v1/diary/1234']);

        await diaryService.postQuestion({ body, clientId: '1234', res });

        expect(cacheService.del).toBeCalled();
      });
    });
  });

  describe('[postAnswer]', () => {
    describe('자신의 다이어리에 쓸 때', () => {
      it('BadRequestException을 throw한다.', async () => {
        const diaryId = '1234';
        const clientId = '1234';
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
    });

    describe('이미 답변을 작성했을 때', () => {
      it('ConflictException을 throw한다.', async () => {
        const diaryId = '1234';
        const clientId = '2345';
        const answer: CreateAnswerDto = {
          answerer: 'answerer',
          answers: ['1', '2'],
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkDuplication.mockResolvedValueOnce(true);

        const postAnswer = diaryService.postAnswer({
          diaryId,
          clientId,
          answer,
          res,
        });

        await expect(postAnswer).rejects.toBeInstanceOf(ConflictException);
      });
    });

    describe('question 배열과 answer 배열이 다를 때', () => {
      it('BadRequestException을 throw한다.', async () => {
        const diaryId = '1234';
        const answer: CreateAnswerDto = {
          answerer: 'answerer',
          answers: ['1', '2', '3'],
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkDuplication.mockResolvedValueOnce(false);
        diaryRepository.findById.mockResolvedValueOnce({
          question: ['1', '2'],
        });

        const postAnswer = diaryService.postAnswer({
          diaryId,
          clientId: undefined,
          answer,
          res,
        });

        await expect(postAnswer).rejects.toBeInstanceOf(BadRequestException);
      });
    });

    describe('정상적인 동작일 때', () => {
      it('save 메서드를 호출한다', async () => {
        const diaryId = '1234';
        const answer: CreateAnswerDto = {
          answerer: 'answerer',
          answers: ['1', '2'],
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkDuplication.mockResolvedValueOnce(false);
        diaryRepository.findById.mockResolvedValueOnce({
          question: ['1', '2'],
          answerList: [
            {
              answerer: 'answerer',
              answer: ['1', '2'],
            },
          ],
        });

        await diaryService.postAnswer({
          diaryId,
          clientId: undefined,
          answer,
          res,
        });

        expect(diaryRepository.save).toBeCalled();
      });

      it('cache del를 호출한다', async () => {
        const diaryId = '1234';
        const answer: CreateAnswerDto = {
          answerer: 'answerer',
          answers: ['1', '2'],
        };
        const res = httpMocks.createResponse();
        diaryRepository.checkDuplication.mockResolvedValueOnce(false);
        diaryRepository.findById.mockResolvedValueOnce({
          question: ['1', '2'],
          answerList: [
            {
              answerer: 'answerer',
              answer: ['1', '2'],
            },
          ],
        });
        cacheService.keys.mockResolvedValueOnce(['/v1/diary/answerers/1234']);

        await diaryService.postAnswer({
          diaryId,
          clientId: undefined,
          answer,
          res,
        });

        expect(cacheService.del).toBeCalled();
      });
    });
  });
});
