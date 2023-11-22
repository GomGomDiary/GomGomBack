import { PickType } from '@nestjs/swagger';
import { Answer } from '../../entity/diary.schema';

export class AnswerPostDto extends PickType(Answer, ['answerer', 'answers']) {}
