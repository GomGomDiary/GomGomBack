import { PickType } from '@nestjs/swagger';
import { DiaryDto } from '../diary.dto';

export class ChallengeGetDto extends PickType(DiaryDto, [
  '_id',
  'challenge',
  'questioner',
]) {}
