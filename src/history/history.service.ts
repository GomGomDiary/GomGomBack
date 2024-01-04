import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoryRepository } from '../common/repositories/history.repository';
import { Types } from 'mongoose';
import { PaginateHistoryDto } from '../common/dtos/history.get.dto';
import { generatePaginationQuery } from 'src/utils/pagination';
import { HistoryIdDto } from '../common/dtos/historyId.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async findAll(
    clientId: Types.ObjectId,
    paginateHistoryDto: PaginateHistoryDto,
  ) {
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

  async findOne(historyIdDto: HistoryIdDto, clientId: Types.ObjectId) {
    const historyItem = await this.historyRepository.findOne(
      historyIdDto,
      clientId,
    );
    if (!historyItem) {
      throw new NotFoundException(
        `${clientId} 유저의 ${historyIdDto.historyId} history가 존재하지 않습니다`,
      );
    }

    return historyItem;
  }
}
