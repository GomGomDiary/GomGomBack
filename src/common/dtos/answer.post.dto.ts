import { PickType } from '@nestjs/swagger';
import { Answer } from '../../models/diary.schema';

export class AnswerPostDto extends PickType(Answer, ['answerer', 'answers']) {}
