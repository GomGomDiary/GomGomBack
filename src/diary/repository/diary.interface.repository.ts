import { Diary } from '../../entities/diary.schema';
import { DiaryPostDto } from '../../dtos/diary.post.dto';

export interface DiaryInterfaceRepository {
  checkDuplication(diaryId: string, clientId: string): Promise<boolean>;
  checkOwnership(id: string): Promise<boolean>;
  create(diary: DiaryPostDto): Promise<Diary>;
  createWithId(id: string, body: DiaryPostDto): Promise<Diary>;
  existAsAnswerer(id: string): Promise<boolean>;
  existAsDiaryAnswerer(diaryId: string, cookieId: string): Promise<boolean>;
  findDiaryWithoutAnswers(diaryId: string): Promise<Diary>;
  findAnswerByAnswerId(diaryId: string, answerId: string): Promise<Diary>;
  findQuestion(diaryId: string): Promise<Diary>;
  findField(
    diaryId: string,
    field: { [key in keyof Diary]?: number | string },
  ): Promise<Diary>;
  save(diary: any[]): Promise<Diary>;
}
