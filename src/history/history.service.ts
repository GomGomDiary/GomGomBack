import { Injectable } from '@nestjs/common';
import { HistoryRepository } from './repository/history.repository';
import { DiaryIdDto } from './dto/diaryId.dto';
import { ObjectId } from 'mongoose';
import { PaginateHistoryDto } from './dto/history.get.dto';
import { generatePaginationQuery } from 'src/utils/pagination';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async findAll(clientId: ObjectId, paginateHistoryDto: PaginateHistoryDto) {
    const query = generatePaginationQuery(
      { diaryId: clientId },
      null,
      paginateHistoryDto.next,
    );

    const historyList = await this.historyRepository.findHistoryList(
      query.paginatedQuery,
      paginateHistoryDto.take,
    );

    const result = {
      historyList,
      next: historyList[historyList.length - 1]?._id,
    };

    return result;
  }
}
