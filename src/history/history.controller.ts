import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { MongoDBIdPipe } from 'src/common/pipe/cookieObjectId.pipe';
import { Cookie } from 'src/common/decorator/cookie.decorator';
import { EmptyPipe } from 'src/common/pipe/empty.pipe';
import { ReturnValueToDto } from 'src/common/decorator/returnValueToDto';
import { HistoryGetListDto, PaginateHistoryDto } from './dto/history.get.dto';
import { ParseMongoIdPipe } from 'src/common/pipe/mongoIdParse.pipe';
import { ObjectId } from 'mongoose';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('')
  @ReturnValueToDto(HistoryGetListDto)
  async findList(
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    diaryId: ObjectId,
    @Query() query: PaginateHistoryDto,
    // @Query('next', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe) next: ObjectId,
    // @Query('take', ParseIntPipe) take: number,
  ) {
    return this.historyService.findAll(diaryId, query);
  }
}
