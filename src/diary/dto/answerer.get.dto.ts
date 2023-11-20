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
  @ApiProperty({
    example: [
      {
        _id: '654ba13be9664d0e9b7a82fa',
        answerer: 'yoon',
        createdAt: '2023-11-08T14:54:51.929Z',
        updatedAt: '2023-11-08T14:54:51.929Z',
        isPermission: true,
      },
      {
        _id: '654e83cf8e4dec550733931c',
        answerer: 'yoon',
        createdAt: '2023-11-15T15:43:45.050Z',
        updatedAt: '2023-11-15T15:43:45.050Z',
        isPermission: false,
      },
    ],
  })
  @Type(() => AnswerWithPermission)
  @Expose()
  answererList: AnswerWithPermission[];
}
