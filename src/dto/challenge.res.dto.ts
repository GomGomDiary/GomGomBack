import { PickType } from '@nestjs/swagger';
import { Diary } from 'src/entity/diary.schema';

export class ChallengeShowDto extends PickType(Diary, [
  '_id',
  'challenge',
  'questioner',
]) {}
