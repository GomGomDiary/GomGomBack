import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaOptions, Document } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Answer extends Document {
  @Prop()
  answerer: string;
  @Prop()
  answers: any[];
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema(options)
export class Diary extends Document {
  @Prop({
    required: true,
  })
  questioner: string;

  @Prop()
  question: any[];

  @Prop()
  challenge: string;

  @Prop()
  countersign: string;

  @Prop({
    type: [AnswerSchema],
  })
  answerList: Answer[];
}

export const DiarySchema = SchemaFactory.createForClass(Diary);
