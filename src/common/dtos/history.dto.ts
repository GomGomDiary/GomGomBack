import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DiaryDto } from './diary.dto';
import { TransformObjectId } from '../decorators/mongoIdTransform.decorator';

export class HistoryDto extends DiaryDto {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'diaryId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectId()
  @Expose()
  diaryId: Types.ObjectId;

  @ApiProperty({
    example: '4',
    description: 'Answerer 수',
    required: true,
  })
  @Expose()
  numberOfAnswerers: number;
}
