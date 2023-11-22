import { Test, TestingModule } from '@nestjs/testing';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CanActivate } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

describe('DiaryController', () => {
  let diaryController: DiaryController;

  const mockDiaryService = {};
  const mockAuthService = {};
  const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiaryController],
      providers: [
        { provide: DiaryService, useValue: mockDiaryService },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .compile();

    diaryController = module.get<DiaryController>(DiaryController);
  });

  it('should be defined', () => {
    expect(diaryController).toBeDefined();
  });
});
