import { ApiProperty, PickType } from '@nestjs/swagger';
import { Diary } from '../../models/diary.schema';
import { Expose } from 'class-transformer';

export class QuestionShowDto extends PickType(Diary, ['_id', 'question']) {
  @ApiProperty({
    example: '3',
    description: 'questionList length',
  })
  @Expose()
  get questionLength() {
    return this.question.length;
  }
}
