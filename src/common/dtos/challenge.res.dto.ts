import { PickType } from '@nestjs/swagger';
import { Diary } from 'src/models/diary.schema';

export class ChallengeGetDto extends PickType(Diary, [
  '_id',
  'challenge',
  'questioner',
]) {}
