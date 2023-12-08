import { PickType } from '@nestjs/swagger';
import { Diary } from 'src/entities/diary.schema';

export class ChallengeShowDto extends PickType(Diary, [
  '_id',
  'challenge',
  'questioner',
]) {}
