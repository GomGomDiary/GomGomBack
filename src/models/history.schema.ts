import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Diary } from './diary.schema';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { DiaryDto } from 'src/common/dtos/diary.dto';

@Schema()
export class History extends Diary {
  // @ApiProperty({
  //   example: '634ba08de9664d0e9b7a82f8',
  //   description: 'diaryId',
  //   required: true,
  // })
  // @Type(() => Types.ObjectId)
  // @Transform(
  //   (value) => {
  //     return value.obj.diaryId;
  //   },
  //   { toClassOnly: true },
  // )
  // @TransformObjectIdToString('diaryId', { toPlainOnly: true })
  // @Expose()
  @Prop()
  diaryId: Types.ObjectId;

  // @Expose()
  @Prop()
  numberOfAnswerers: number;
}

export const HistorySchema = SchemaFactory.createForClass(History);

// HistorySchema.index({ diaryId: 1 });
