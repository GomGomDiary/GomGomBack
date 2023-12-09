import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Diary } from './diary.schema';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';

@Schema()
export class DiaryHistory extends Diary {
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
  @Prop()
  diaryId: Types.ObjectId;

  @Expose()
  @Prop()
  numberOfAnswerers: number;
}

export const DiaryHistorySchema = SchemaFactory.createForClass(DiaryHistory);

DiaryHistorySchema.index({ diaryId: 1 });
