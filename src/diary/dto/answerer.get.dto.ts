import { ApiProperty, PickType } from '@nestjs/swagger';
import { Diary } from '../diary.schema';

export class AnswererGetDto extends PickType(Diary, ['answerList']) {
  @ApiProperty({
    example: '644ba08d90664d0e9b7a82b7',
    description: '_id',
    required: true,
  })
  _id: string;
}
