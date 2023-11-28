import { Test, TestingModule } from '@nestjs/testing';
import { DiaryService } from './diary.service';
import { DiaryRepository } from './repository/diary.repository';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import httpMocks from 'node-mocks-http';

describe('DiaryService', () => {
  let service: DiaryService;

  beforeEach(async () => {
    const mockDiaryRepository = {
      checkDuplication: (diaryId, clientId) => {
        return true;
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryService,
        {
          provide: DiaryRepository,
          useValue: mockDiaryRepository,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => {
              return true;
            },
            set: async () => {
              Promise.resolve();
            },
          },
        },
      ],
    }).compile();

    service = module.get<DiaryService>(DiaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('diaryId와 clientId가 중복된 경우 에러 반환', async () => {
    const res = httpMocks.createResponse();
    const content = {
      diaryId: '123',
      clientId: '123',
      answer: {
        answerer: '123',
        answers: ['123'],
      },
      res,
    };
    expect(service.postAnswer(content)).rejects.toThrow();
  });

  it('답변을 이미 작성한 경우 409 에러 반환', () => {
    const res = httpMocks.createResponse();
    const content = {
      diaryId: '123',
      clientId: '456',
      answer: {
        answerer: '123',
        answers: ['123'],
      },
      res,
    };
    expect(service.postAnswer(content)).rejects.toThrow();
  });
});
