import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DiaryService } from './diary.service';

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
  async postQuestion(@Body() body: any) {
    return this.diaryService.postQuestion(body);
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
