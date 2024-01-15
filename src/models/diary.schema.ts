import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaOptions, Document, Types } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Answer {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  answerer: string;

  @Prop()
  answers: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  roomId?: Types.ObjectId;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

export type DiaryDocumentType = Omit<Diary, keyof Document>;

@Schema(options)
export class Diary {
  _id: Types.ObjectId;

  @Prop()
  question: string[];

  @Prop({
    required: true,
  })
  questioner: string;

  @Prop()
  challenge: string;

  @Prop()
  countersign: string;

  @Prop({
    type: [AnswerSchema],
  })
  answerList: Answer[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DiarySchema = SchemaFactory.createForClass(Diary);
