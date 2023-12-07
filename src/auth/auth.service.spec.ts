import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DiaryRepository } from 'src/diary/repository/diary.repository';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  const mockDiaryRepository = { findField: jest.fn() };
  const mockJwtService = { signAsync: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: DiaryRepository,
          useValue: mockDiaryRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a jwt token when sign-in is successful', async () => {
      const mockUser = { countersign: '1234', _id: '12345678' };

      mockDiaryRepository.findField.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwtToken');

      const result = await authService.signIn('someId', '1234');
      expect(result).toEqual({ diaryToken: 'jwtToken' });
    });

    it('should throw UnauthorizedException when countersign is incorrect', async () => {
      const mockUser = { countersign: '1234', _id: '12345678' };

      mockDiaryRepository.findField.mockResolvedValue(mockUser);

      const signIn = authService.signIn('someId', 'wrongCountersign');
      await expect(signIn).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
