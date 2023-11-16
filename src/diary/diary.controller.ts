import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryPostDto } from './dto/diary.post.dto';
import { Cookie } from 'src/common/decorator/cookie.decorator';
import { Response } from 'express';
import { MongoDBIdPipe } from 'src/common/pipe/cookieObjectId.pipe';
import { EmptyPipe } from 'src/common/pipe/empty.pipe';
import { AnswerPostDto } from './dto/answer.post.dto';
import { AuthService } from 'src/auth/auth.service';
import { CountersignPostDto } from './dto/counstersign.post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QuestionGetDto } from './dto/question.get.dto';
import { AnswererGetDto } from './dto/answerer.get.dto';
import { AnswerGetDto } from './dto/answer.get.dto';

// AS-IS
// POST /question
// GET /answer/:id
// GET /answerer/:questionId
// POST /answer/:questionId
// GET /cookie

// TO-BE
// POST /diary/question
// GET /diary/answer/:id
// GET /diary/answerer/:questionId
// POST /diary/answer/:questionId
// GET /cookie

@ApiTags('Diary')
@Controller({
  version: '1',
  path: 'diary',
})
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '질문 보기',
    description: '정책상의 이유로 해당 API는 Bearer token이 필요합니다.',
  })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: '성공 시 200을 응답합니다.',
    type: QuestionGetDto,
  })
  @ApiUnauthorizedResponse({
    description: 'token에 문제가 있을 경우 401을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @UseGuards(AuthGuard)
  @Get('question/:diaryId')
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
    @Body() body: DiaryPostDto,
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
    @Res() res: Response,
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
  @Get('answerers/:diaryId')
  async getAnswerers(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
  ) {
    return this.diaryService.getAnswerers({ diaryId, clientId });
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
  @Get('answer/:diaryId/:answerId')
  async getAnswer(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
    @Param('answerId', MongoDBIdPipe) answerId: string,
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe) clientId: string,
  ) {
    return this.diaryService.getAnswer({ diaryId, answerId, clientId });
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
  @UseGuards(AuthGuard)
  @Post('answer/:diaryId')
  async postAnswer(
    @Param('diaryId') diaryId: string,
    @Body() body: AnswerPostDto,
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
    schema: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          example: '644ba08d90664d0e9b7a82b7',
        },
        challenge: {
          type: 'string',
          example: '내 생일',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 400을 응답합니다.',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @Get('challenge/:diaryId')
  async getChallenge(@Param('diaryId', MongoDBIdPipe) diaryId: string) {
    return this.diaryService.getChallenge(diaryId);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 201,
    description: '성공 시 201을 응답합니다.',
    schema: {
      type: 'object',
      properties: {
        diaryToken: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTRiYTA4ZGU5NjY0ZDBlOWI3YTgyZjciLCJpYXQiOjE2OTk1MzY2ODIsImV4cCI6MTY5OTU0MDI4Mn0.NoNhAFSkSWc9FYduBApS_-X2ODDGlkGwR7FBZ4DZw',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'request body field가 충분하지 않거나 cookie에 존재하는 diaryUser의 id가 적절하지 않을 경우 400을 응답합니다.',
  })
  @ApiUnauthorizedResponse({
    description: 'countersign이 올바르지 않을 경우 401을 응답합니다',
  })
  @ApiNotFoundResponse({
    description: 'diaryId가 존재하지 않을 경우 404를 응답합니다.',
  })
  @Post('/countersign/:diaryId')
  async signIn(
    @Body() body: CountersignPostDto,
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
  ) {
    return this.authService.signIn(diaryId, body.countersign);
  }
}
