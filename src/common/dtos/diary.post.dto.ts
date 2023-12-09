import { PickType } from '@nestjs/swagger';
import { Diary } from '../../models/diary.schema';

export class DiaryPostDto extends PickType(Diary, [
  'question',
  'questioner',
  'challenge',
  'countersign',
]) {}
