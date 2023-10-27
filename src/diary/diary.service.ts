import { Injectable } from '@nestjs/common';
import { DiaryRepository } from './diary.repository';

@Injectable()
export class DiaryService {
  constructor(private readonly diaryRepository: DiaryRepository) {}
  async postQuestion(body: any) {
    await this.diaryRepository.create(body);

    return 'service getQuestion';
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
    const test = await this.diaryRepository.exist(questionId);
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
