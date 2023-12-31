import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { DiaryDto } from './diary.dto';

export class HistoryDto extends DiaryDto {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'diaryId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @Transform(
    (value) => {
      return value.obj.diaryId;
    },
    { toClassOnly: true },
  )
  @TransformObjectIdToString('diaryId', { toPlainOnly: true })
  @Expose()
  diaryId: Types.ObjectId;

  @Expose()
  numberOfAnswerers: number;
}
