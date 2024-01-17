import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { HistoryRepository } from '../common/repositories/history.repository';
import { Types } from 'mongoose';
import {
  HistoryGetDto,
  PaginateHistoryDto,
} from '../common/dtos/response/history.get.dto';
import { getModelToken } from '@nestjs/mongoose';
import { History } from 'src/models/history.schema';
import { HistoryIdDto } from 'src/common/dtos/request/historyId.dto';
import { NotFoundException } from '@nestjs/common';

describe('HistoryService', () => {
  let historyService: HistoryService;
  let historyRepository: HistoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        HistoryRepository,
        {
          provide: getModelToken(History.name),
          useValue: {},
        },
      ],
    }).compile();

    historyService = module.get<HistoryService>(HistoryService);
    historyRepository = module.get<HistoryRepository>(HistoryRepository);
  });

  it('should be defined', () => {
    expect(historyService).toBeDefined();
  });

  describe('findAll', () => {
    it('history list를 반환한다.', async () => {
      const historyList: [HistoryGetDto] = [
        {
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          numberOfAnswerers: 0,
        },
      ];
      const clientId = new Types.ObjectId();
      const paginateHistoryDto: PaginateHistoryDto = {
        take: 5,
      };
      const result = {
        historyList,
        next: historyList[historyList.length - 1]?._id,
      };

      jest
        .spyOn(historyRepository, 'findHistoryList')
        .mockResolvedValue(historyList);

      expect(
        await historyService.findAll(clientId, paginateHistoryDto),
      ).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('findOne이 null을 반환할 경우 NotFoundException을 반환한다', async () => {
      const clientId = new Types.ObjectId();
      const historyIdDto: HistoryIdDto = { historyId: new Types.ObjectId() };

      jest.spyOn(historyRepository, 'findOne').mockResolvedValue(null);

      await expect(
        historyService.findOne(historyIdDto, clientId),
      ).rejects.toThrow(NotFoundException);
    });

    it('historyItem을 반환한다', async () => {
      const result: History = {
        _id: new Types.ObjectId(),
        diaryId: new Types.ObjectId(),
        answerList: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        numberOfAnswerers: 0,
        challenge: 'challenge',
        countersign: 'countersign',
        question: [],
        questioner: 'questioner',
      };
      const clientId = new Types.ObjectId();
      const historyIdDto: HistoryIdDto = { historyId: new Types.ObjectId() };

      jest.spyOn(historyRepository, 'findOne').mockResolvedValue(result);

      expect(await historyService.findOne(historyIdDto, clientId)).toEqual(
        result,
      );
    });
  });
});
