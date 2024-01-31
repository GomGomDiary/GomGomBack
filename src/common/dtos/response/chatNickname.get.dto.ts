import { IntersectionType, PickType } from '@nestjs/swagger';
import { AnswerDto, DiaryDto } from '../diary.dto';

export class ChatNicknameGetDto extends IntersectionType(
  PickType(DiaryDto, ['questioner']),
  PickType(AnswerDto, ['answerer']),
) {}
