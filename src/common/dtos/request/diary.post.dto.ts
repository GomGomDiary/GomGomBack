import { PickType } from '@nestjs/swagger';
import { DiaryDto } from '../diary.dto';

export class CreateDiaryDto extends PickType(DiaryDto, [
  'question',
  'questioner',
  'challenge',
  'countersign',
]) {}
