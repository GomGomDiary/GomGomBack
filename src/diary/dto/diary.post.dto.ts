import { PickType } from '@nestjs/swagger';
import { Diary } from '../diary.schema';

export class DiaryPostDto extends PickType(Diary, [
  'question',
  'questioner',
  'challenge',
  'countersign',
]) {}
