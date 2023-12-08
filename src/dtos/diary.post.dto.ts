import { PickType } from '@nestjs/swagger';
import { Diary } from '../entities/diary.schema';

export class DiaryPostDto extends PickType(Diary, [
  'question',
  'questioner',
  'challenge',
  'countersign',
]) {}
