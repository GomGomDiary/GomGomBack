import { ApiProperty, PickType } from '@nestjs/swagger';
import { Answer, Diary } from '../../entity/diary.schema';
import { Expose, Type } from 'class-transformer';

class AnswerWithPermission extends PickType(Answer, [
  '_id',
  'answerer',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({
    example: true,
    description: 'permission',
    required: true,
  })
  @Expose()
  isPermission: boolean;
}

export class AnswererGetDto extends PickType(Diary, ['_id', 'questioner']) {
  @Expose()
  @Type(() => AnswerWithPermission)
  answererList: AnswerWithPermission[];
}
