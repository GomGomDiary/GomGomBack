import { PickType } from '@nestjs/swagger';
import { AnswerDto } from '../diary.dto';

export class CreateAnswerDto extends PickType(AnswerDto, [
  'answerer',
  'answers',
]) {}
