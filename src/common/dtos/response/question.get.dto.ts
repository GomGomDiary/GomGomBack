import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DiaryDto } from '../diary.dto';

export class QuestionShowDto extends PickType(DiaryDto, ['_id', 'question']) {
  @ApiProperty({
    example: '3',
    description: 'questionList length',
  })
  @Expose()
  get questionLength() {
    return this.question.length;
  }
}
