import {
  Body,
  CacheTTL,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto as CreateDiaryDto } from '../common/dtos/request/diary.post.dto';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import { Response } from 'express';
import { MongoDBIdPipe } from 'src/common/pipes/cookieObjectId.pipe';
import { CreateAnswerDto } from '../common/dtos/request/answer.post.dto';
import { AuthService } from 'src/auth/auth.service';
import { CountersignPostDto } from '../common/dtos/request/counstersign.post.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QuestionShowDto } from '../common/dtos/response/question.get.dto';
import {
  AnswererGetDto,
  PaginateAnswererDto,
} from '../common/dtos/response/answerer.get.dto';
import { AnswerGetDto } from '../common/dtos/response/answer.get.dto';
import { ReturnValueToDto } from 'src/common/decorators/returnValueToDto';
import { ChallengeGetDto } from '../common/dtos/response/challenge.get.dto';
import { DiaryTokenShowDto } from '../common/dtos/response/countersign.res.dto';
import { HttpCacheInterceptor } from 'src/common/interceptors/cache.interceptor';
import { CACHE_TTL } from 'src/utils/constants';
import { AnswerGuard } from 'src/auth/guards/cookie.guard';
import { EmptyPipe } from 'src/common/pipes/empty.pipe';
import { ParseMongoIdPipe } from 'src/common/pipes/mongoIdParse.pipe';
import { Types } from 'mongoose';

@ApiTags('Diary')
@Controller({
  path: 'diary',
  version: '1',
})
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '다이어리 존재 여부 확인',
    description: '해당 Cookie를 가진 다이어리가 존재하는지 확인합니다.',
  })
  @ApiOkResponse({
    description: '성공 시 200을 응답합니다.',
    schema: {
      example: true,
    },
  })
  @ApiBadRequestResponse({
    description: 'cookie의 diaryId가 적절하지 않을 경우 400을 응답합니다.',
  })
  @Get('')
  async isQuestioner(@Cookie('diaryUser', MongoDBIdPipe) clientId: string) {
    return this.diaryService.checkDiaryOwnership(clientId);
  }

  @ApiOperation({
    summary: '답변 존재 여부 확인',
    description: '해당 Cookie를 가진 답변이 존재하는지 확인합니다.',
  })
  @ApiOkResponse({
    description: '성공 시 200을 응답합니다.',
    schema: {
      example: true,
    },
  })
  @ApiBadRequestResponse({
    description: 'cookie의 diaryId가 적절하지 않을 경우 400을 응답합니다.',
  })
  @ApiParam({ name: 'diaryId', type: String })
  @Get(':diaryId')
  async isAnswerer(
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
    @Param('diaryId', MongoDBIdPipe, EmptyPipe, ParseMongoIdPipe)
    diaryId: Types.ObjectId,
  ) {
    return this.diaryService.checkAnswerer(clientId, diaryId);
  }

  @ApiOperation({
    summary: '다이어리 업데이트 요청 시그널',
    description: '다이어리 업데이트를 요청하는 시그널을 보냅니다.',
  })
  @Post('updating-signal')
  async postUpdatingSignal() {
    return this.diaryService.postUpdatingSignal();
  }

  @ApiOperation({
    summary: '질문 보기',
    description: '정책상의 이유로 해당 API는 Bearer token이 필요합니다.',
  })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: '성공 시 200을 응답합니다.',
    type: QuestionShowDto,
  })
  @ApiUnauthorizedResponse({
    description: 'token에 문제가 있을 경우 401을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @UseGuards(AuthGuard)
  @Get('question/:diaryId')
  @ReturnValueToDto(QuestionShowDto)
  async getQuestion(@Param('diaryId', MongoDBIdPipe) diaryId: string) {
    return this.diaryService.getQuestion(diaryId);
  }

  @ApiOperation({ summary: '질문 쓰기' })
  @ApiResponse({
    status: 201,
    description:
      'diaryUser 쿠키가 존재하지 않아 새로운 diary가 만들어졌을시 201을 응답합니다.',
  })
  @ApiNoContentResponse({
    description:
      'diaryUser 쿠키가 존재해 기존 diary update시 204를 응답합니다.',
  })
  @ApiBadRequestResponse({
    description:
      'request body field가 충분하지 않거나 cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 400을 응답합니다. 자세한 내용은 error message를 참고해주세요.',
  })
  @ApiCookieAuth('diaryUser')
  @Post('question')
  async postQuestion(
    @Body() body: CreateDiaryDto,
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.diaryService.postQuestion({ clientId, body, res });
  }

  @ApiOperation({ summary: '답변자 보기' })
  @ApiResponse({
    status: 200,
    description: '성공 시 200을 응답합니다.',
    type: AnswererGetDto,
  })
  @ApiBadRequestResponse({
    description:
      'diaryId나 cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 400을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @ApiQuery({
    name: 'start',
  })
  @ApiQuery({
    name: 'take',
  })
  @ApiQuery({
    name: 'sortOrder',
  })
  @ApiParam({
    name: 'diaryId',
  })
  // @UseInterceptors(HttpCacheInterceptor) // TODO 캐시 무효
  // @CacheTTL(CACHE_TTL)
  @Get('answerers/:diaryId')
  @ReturnValueToDto(AnswererGetDto)
  async getAnswerers(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
    @Query('') query: PaginateAnswererDto,
  ) {
    return this.diaryService.getAnswerers(diaryId, query);
  }

  @ApiOperation({ summary: '답변 보기' })
  @ApiResponse({
    status: 200,
    description: '성공 시 200을 응답합니다.',
    type: AnswerGetDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 401을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @ApiParam({
    name: 'diaryId',
    required: true,
  })
  @UseGuards(AnswerGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(CACHE_TTL)
  @Get('answer/:diaryId/:answerId')
  @ReturnValueToDto(AnswerGetDto)
  async getAnswer(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
    @Param('answerId', MongoDBIdPipe) answerId: string,
  ) {
    return this.diaryService.getAnswer({ diaryId, answerId });
  }

  @ApiOperation({ summary: '답변 쓰기' })
  @ApiBearerAuth('Token')
  @ApiResponse({
    status: 201,
    description: '성공 시 201을 응답합니다.',
  })
  @ApiBadRequestResponse({
    description:
      'request body field가 충분하지 않거나 cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우, 또는 자기 자신의 diary에 answer를 제출할 경우 400을 응답합니다.',
  })
  @ApiUnauthorizedResponse({
    description: 'token에 문제가 있을 경우 401을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 답변한 경우 409를 응답합니다.',
  })
  @ApiParam({
    name: 'diaryId',
    required: true,
  })
  @UseGuards(AuthGuard)
  @Post('answer/:diaryId')
  async postAnswer(
    @Param('diaryId') diaryId: string,
    @Body() body: CreateAnswerDto,
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.diaryService.postAnswer({
      diaryId,
      clientId,
      answer: body,
      res,
    });
  }

  @ApiOperation({ summary: '암호 보기' })
  @ApiResponse({
    status: 200,
    description: '성공 시 200을 응답합니다.',
    type: ChallengeGetDto,
  })
  @ApiBadRequestResponse({
    description:
      'cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 400을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @ApiParam({
    name: 'diaryId',
    required: true,
  })
  @Get('challenge/:diaryId')
  @ReturnValueToDto(ChallengeGetDto)
  async getChallenge(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
  ): Promise<ChallengeGetDto> {
    return this.diaryService.getChallenge(diaryId);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 201,
    description: '성공 시 201을 응답합니다.',
    type: DiaryTokenShowDto,
  })
  @ApiBadRequestResponse({
    description:
      'body field가 충분하지 않거나 cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 400을 응답합니다.',
  })
  @ApiUnauthorizedResponse({
    description: 'countersign이 올바르지 않을 경우 401을 응답합니다',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @ApiParam({
    name: 'diaryId',
    required: true,
  })
  @Post('countersign/:diaryId')
  @ReturnValueToDto(DiaryTokenShowDto)
  async signIn(
    @Body() body: CountersignPostDto,
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
  ): Promise<DiaryTokenShowDto> {
    return this.authService.signIn(diaryId, body.countersign);
  }
}
