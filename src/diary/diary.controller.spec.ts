import { Test, TestingModule } from '@nestjs/testing';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CanActivate } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AnswerGuard } from 'src/auth/guards/cookie.guard';
import { HttpCacheInterceptor } from 'src/common/interceptors/cache.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DiaryController', () => {
  let diaryController: DiaryController;

  const mockDiaryService = {};
  const mockAuthService = {};
  const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
  const mockInterceptor = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiaryController],
      providers: [
        { provide: DiaryService, useValue: mockDiaryService },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockInterceptor,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(AnswerGuard)
      .useValue(mockGuard)
      .overrideInterceptor(HttpCacheInterceptor)
      .useClass(HttpCacheInterceptor)
      .compile();

    diaryController = module.get<DiaryController>(DiaryController);
  });

  it('should be defined', () => {
    expect(diaryController).toBeDefined();
  });
});
