import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoryRepository } from './repository/history.repository';
import { ObjectId } from 'mongoose';
import { PaginateHistoryDto } from '../dto/history.get.dto';
import { generatePaginationQuery } from 'src/utils/pagination';
import { DiaryIdDto } from '../dto/diaryId.dto';

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

  async findOne(diaryIdDto: DiaryIdDto, clientId: ObjectId) {
    const diaryHistoryItem = await this.historyRepository.findOne(
      diaryIdDto,
      clientId,
    );
    if (!diaryHistoryItem) {
      throw new NotFoundException(
        `${clientId} 유저의 ${diaryIdDto.diaryId} history가 존재하지 않습니다`,
      );
    }

    return diaryHistoryItem;
  }
}
