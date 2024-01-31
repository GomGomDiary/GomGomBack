import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Diary } from './diary.schema';
import { Types } from 'mongoose';

@Schema()
export class History extends Diary {
  @Prop()
  diaryId: Types.ObjectId;

  @Prop()
  numberOfAnswerers: number;
}

export const HistorySchema = SchemaFactory.createForClass(History);

// HistorySchema.index({ diaryId: 1 });
