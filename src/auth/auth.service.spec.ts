import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DiaryRepository } from 'src/common/repositories/diary.repository';
import { UnauthorizedException } from '@nestjs/common';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import mongoose from 'mongoose';

describe('AuthService', () => {
  let authService: AuthService;
  let diaryRepository;
  let jwtService: DeepMocked<JwtService>;
  // let diaryRepository: DeepMocked<DiaryRepository>;
  const mockDiaryRepository = {
    findField: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DiaryRepository,
          useValue: mockDiaryRepository,
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    authService = module.get<AuthService>(AuthService);
    diaryRepository = module.get(DiaryRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('jwt token을 반환한다.', async () => {
      const mockUser = {
        countersign: '1234',
        _id: new mongoose.Types.ObjectId(),
      };

      diaryRepository.findField.mockResolvedValueOnce(mockUser);
      jwtService.signAsync.mockResolvedValueOnce('jwtToken');

      const result = await authService.signIn('someId', '1234');

      expect(result).toEqual({ diaryToken: 'jwtToken' });
    });

    it('countersign이 올바르지 않을 경우 UnauthorizedException을 발생시킨다.', async () => {
      const mockUser = {
        countersign: '1234',
        _id: new mongoose.Types.ObjectId(),
      };
      diaryRepository.findField.mockResolvedValueOnce(mockUser);

      const signIn = authService.signIn('someId', 'wrongCountersign');
      await expect(signIn).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
