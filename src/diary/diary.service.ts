import { Injectable } from '@nestjs/common';
import { DiaryRepository } from './diary.repository';
import { DiaryPostDto } from './dto/diary.post.dto';
import { Response } from 'express';

@Injectable()
export class DiaryService {
  constructor(private readonly diaryRepository: DiaryRepository) {}
  async postQuestion({
    body,
    userId,
    res,
  }: {
    body: DiaryPostDto;
    userId: string;
    res: Response;
  }) {
    const isQuestioner = await this.diaryRepository.existAsQuestioner(userId);
    // if Questioner (can be Answerer)
    // update Diary 업데이트
    // soft delete
    if (isQuestioner) {
      await this.diaryRepository.updateOne(userId, body);
      return;
    }
    // if Answerer o (Questioner x)
    // create Diary
    const isAnswerer = await this.diaryRepository.existAsAnswerer(userId);
    if (isAnswerer) {
      await this.diaryRepository.createWithId(userId, body);
      return;
    }
    // if Newbie (Questioner x, Answerer x)
    // create Diary && set cookie
    const diary = await this.diaryRepository.create(body);
    return res.cookie('diaryUser', diary._id);
  }

  async getAnswer() {
    const t = await this.diaryRepository.checkDuplication({
      questionId: '653c19b5155bd80ed2844168',
      clientId: '653c24c08f49f8b5f14b2996',
    });
    console.log(t);

    return 'service getAnswer';
  }

  async getAnswerers(questionId: string) {
    const test = await this.diaryRepository.existAsQuestioner(questionId);
    const t = await this.diaryRepository.findById(questionId);
    console.log(test);
    return 'service getAnswerer';
  }

  async postAnswer({ questionId, answer }) {
    const diary = await this.diaryRepository.findById(questionId);
    diary.answerList.push(answer);

    await this.diaryRepository.save([diary]);

    return 'service postAnswer';
  }
}
