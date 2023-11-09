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

@Controller({
  version: '1',
  path: 'diary',
})
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('question/:diaryId')
  async getQuestion(@Param('diaryId', MongoDBIdPipe) diaryId: string) {
    return this.diaryService.getQuestion(diaryId);
  }

  @Post('question')
  async postQuestion(
    @Body() body: DiaryPostDto,
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
    @Res() res: Response,
  ) {
    return this.diaryService.postQuestion({ clientId, body, res });
  }

  @Get('answerers/:diaryId')
  async getAnswerers(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
    @Cookie('diaryUser', MongoDBIdPipe) clientId: string,
  ) {
    return this.diaryService.getAnswerers({ diaryId, clientId });
  }

  @Get('answer/:diaryId/:answerId')
  async getAnswer(
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
    @Param('answerId', MongoDBIdPipe) answerId: string,
    @Cookie('diaryUser', MongoDBIdPipe, EmptyPipe) clientId: string,
  ) {
    return this.diaryService.getAnswer({ diaryId, answerId, clientId });
  }

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

  @Get('challenge/:diaryId')
  async getChallenge(@Param('diaryId', MongoDBIdPipe) diaryId: string) {
    return this.diaryService.getChallenge(diaryId);
  }

  @Post('/countersign/:diaryId')
  async signIn(
    @Body() body: CountersignPostDto,
    @Param('diaryId', MongoDBIdPipe) diaryId: string,
  ) {
    return this.authService.signIn(diaryId, body.countersign);
  }
}
