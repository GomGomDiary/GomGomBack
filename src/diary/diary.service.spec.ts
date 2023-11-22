import { Test, TestingModule } from '@nestjs/testing';
import { DiaryService } from './diary.service';
import { DiaryRepository } from './diary.repository';
import { ConfigService } from '@nestjs/config';

describe('DiaryService', () => {
  let service: DiaryService;

  beforeEach(async () => {
    const mockDiaryRepository = {};
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
      ],
    }).compile();

    service = module.get<DiaryService>(DiaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
