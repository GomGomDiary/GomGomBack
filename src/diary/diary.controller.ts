import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryPostDto } from './dto/diary.post.dto';
import { Cookie } from 'src/common/cookie/cookie.decorator';
import { Response } from 'express';
import { CookieCheckPipe } from 'src/common/pipe/cookieCheck.pipe';

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

@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}
  @Post('question')
  async postQuestion(
    @Body() body: DiaryPostDto,
    @Cookie('diaryUser', CookieCheckPipe) userId: string,
    @Res() res: Response,
  ) {
    return this.diaryService.postQuestion({ body, userId, res });
  }
  @Get('answer/:questionId')
  async getAnswer(@Param('questionId') questionId: string) {
    return this.diaryService.getAnswer();
  }

  @Get('answerers/:questionId')
  async getAnswerers(@Param('questionId') questionId: string) {
    return this.diaryService.getAnswerers(questionId);
  }

  @Post('answer/:questionId')
  async postAnswer(@Param('questionId') questionId: string, @Body() body: any) {
    return this.diaryService.postAnswer({ questionId, answer: body });
  }
}
