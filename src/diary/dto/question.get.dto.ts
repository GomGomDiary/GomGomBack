import { ApiProperty, PickType } from '@nestjs/swagger';
import { Diary } from '../diary.schema';

export class QuestionGetDto extends PickType(Diary, ['question']) {
  @ApiProperty({
    example: '644ba08d90664d0e9b7a82b7',
    description: 'questionList length',
  })
  _id: string;

  @ApiProperty({
    example: '3',
    description: 'questionList length',
  })
  questionLength: number;
}
