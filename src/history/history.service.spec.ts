import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { createMock } from '@golevelup/ts-jest';

describe('HistoryService', () => {
  let service: HistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<HistoryService>(HistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
