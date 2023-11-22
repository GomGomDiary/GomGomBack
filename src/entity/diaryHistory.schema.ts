import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Diary } from './diary.schema';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class DiaryHistory extends Diary {
  @ApiProperty({ example: '634ba08de9664d0e9b7a82f8' })
  @Prop()
  diaryId: Types.ObjectId;
}
// export class DiaryHistory extends OmitType(Diary, ['_id']){}

export const DiaryHistorySchema = SchemaFactory.createForClass(DiaryHistory);
