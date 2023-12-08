import { PickType } from '@nestjs/swagger';
import { Answer } from '../entities/diary.schema';

export class AnswerPostDto extends PickType(Answer, ['answerer', 'answers']) {}
