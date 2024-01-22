import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DiaryRepository } from 'src/common/repositories/diary.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Diary } from 'src/models/diary.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let diaryRepository: DiaryRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        DiaryRepository,
        JwtService,
        ConfigService,
        {
          provide: getModelToken(Diary.name),
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    diaryRepository = module.get<DiaryRepository>(DiaryRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('user가 존재하지 않을 경우 NotFoundException을 반환한다', async () => {
      const diaryId = new Types.ObjectId().toString();
      const countersignFromClient = 'countersignFromClient';
      const user = null;
      diaryRepository.findField = jest.fn().mockResolvedValue(user);

      await expect(
        authService.signIn(diaryId, countersignFromClient),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('countersign이 올바르지 않을 경우 UnauthorizedException을 반환한다.', async () => {
      const diaryId = new Types.ObjectId().toString();
      const countersignFromClient = 'countersignFromClient';
      const user = {
        countersign: 'wrongCountersign',
      };
      diaryRepository.findField = jest.fn().mockResolvedValue(user);

      await expect(
        authService.signIn(diaryId, countersignFromClient),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('diaryToken 반환시 signAsync를 호출한다', async () => {
      const diaryId = new Types.ObjectId().toString();
      const countersignFromClient = 'rightCountersign';
      const user = {
        countersign: 'rightCountersign',
      };
      diaryRepository.findField = jest.fn().mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      await authService.signIn(diaryId, countersignFromClient);

      expect(jwtService.signAsync).toBeCalled();
    });
  });

  describe('createToken', () => {
    it('chat Token을 반환한다', async () => {
      const diaryId = new Types.ObjectId().toString();
      const payload = {
        sub: diaryId,
      };

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      await authService.createToken(payload);
      expect(jwtService.signAsync).toBeCalled();
    });
  });
});
