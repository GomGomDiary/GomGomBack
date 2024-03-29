import { Controller, Get, Param, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { MongoDBIdPipe } from 'src/common/pipes/cookieObjectId.pipe';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import { EmptyPipe } from 'src/common/pipes/empty.pipe';
import { ReturnValueToDto } from 'src/common/decorators/returnValueToDto';
import {
  HistoryGetListDto,
  HistoryItemGetDto,
  PaginateHistoryDto,
} from '../common/dtos/response/history.get.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/mongoIdParse.pipe';
import { Types } from 'mongoose';
import { HistoryIdDto } from '../common/dtos/request/historyId.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('History')
@Controller({
  path: 'history',
  version: '1',
})
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @ApiOperation({
    summary: '히스토리 리스트 가져오기',
    description: '히스토리 리스트를 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공 시 200을 응답합니다.',
    type: HistoryGetListDto,
  })
  @ApiBadRequestResponse({
    description: 'next query param 혹은 cookie가 적절하지 않을 경우.',
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'next',
    description: 'mongodb objectId가 string 형태로 들어와야합니다.',
    type: String,
    required: false,
  })
  @Get('')
  @ReturnValueToDto(HistoryGetListDto)
  async findList(
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    clientId: Types.ObjectId,
    @Query() query: PaginateHistoryDto,
  ) {
    return this.historyService.findAll(clientId, query);
  }

  @ApiOperation({
    summary: '히스토리 아이템 가져오기',
    description: '히스토리 아이템을 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공 시 200을 응답합니다.',
    type: HistoryItemGetDto,
  })
  @ApiBadRequestResponse({
    description: 'diaryId param || cookie가 적절하지 않을 경우.',
  })
  @ApiNotFoundResponse({
    description: 'history가 존재하지 않을 때 404를 응답합니다.',
  })
  @ApiParam({
    name: 'historyId',
    required: true,
  })
  @Get(':historyId')
  @ReturnValueToDto(HistoryItemGetDto)
  async findOne(
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    clientId: Types.ObjectId,
    @Param() historyIdDto: HistoryIdDto,
  ) {
    return this.historyService.findOne(historyIdDto, clientId);
  }
}
