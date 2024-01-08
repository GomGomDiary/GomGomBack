import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SchemaOptions, Document, Types } from 'mongoose';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { toKoreaTime } from 'src/utils/toKoreaTime';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Answer {
  // @ApiProperty({
  //   example: '634ba08de9664d0e9b7a82f8',
  //   description: 'id',
  //   required: true,
  // })
  // @Type(() => Types.ObjectId)
  // @TransformObjectIdToString('_id', { toPlainOnly: true })
  // @Transform((value) => value.obj._id, { toClassOnly: true })
  @Expose()
  _id: Types.ObjectId;

  // @ApiProperty({
  //   example: 'yoyoo',
  //   description: 'nickname',
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Length(1, 10)
  // @Expose()
  @Prop()
  answerer: string;

  // @ApiProperty({
  //   example: ['answer1', 'answer2', 'answer3'],
  //   description: 'answer list',
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsArray()
  // @ArrayMinSize(3)
  // @ArrayMaxSize(10)
  // @IsString({ each: true })
  // @Length(1, 100, { each: true })
  // @Expose()
  @Prop()
  answers: string[];

  // @ApiProperty({
  //   example: '2022-01-01T00:00:00.000',
  //   description: 'createdAt',
  // })
  // @Expose()
  // @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  @Prop()
  createdAt: Date;

  // @Expose()
  // @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  @Prop()
  updatedAt: Date;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

export type DiaryDocumentType = Omit<Diary, keyof Document>;

@Schema(options)
export class Diary {
  // @ApiProperty({
  //   example: '654ba08de9664d0e9b7a82f7',
  //   description: 'id',
  //   required: true,
  // })
  // @Type(() => Types.ObjectId)
  // @TransformObjectIdToString('_id', { toPlainOnly: true })
  // @Transform((value) => value.obj._id, { toClassOnly: true })
  // @Expose()
  _id: Types.ObjectId;

  // @ApiProperty({
  //   example: ['question1', 'question2', 'question3'],
  //   description: 'question list',
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsArray()
  // @ArrayMinSize(3)
  // @ArrayMaxSize(10)
  // @IsString({ each: true })
  // @Length(1, 100, { each: true })
  // @Expose()
  @Prop()
  question: string[];

  // @ApiProperty({
  //   example: 'yoyoo',
  //   description: 'nickname',
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Length(1, 10)
  // @Expose()
  @Prop({
    required: true,
  })
  questioner: string;

  // @ApiProperty({
  //   example: '내 생일',
  //   description: '암호',
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Length(1, 50)
  // @Expose()
  @Prop()
  challenge: string;

  // @ApiProperty({
  //   example: '0120',
  //   description: '암호에 대한 답',
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Length(1, 50)
  // @Exclude({ toPlainOnly: true })
  @Prop()
  countersign: string;

  // @ApiProperty({
  //   example: [
  //     {
  //       answerer: 'yoon',
  //       _id: '654ba13be9664d0e9b7a82fa',
  //       createdAt: '2023-11-08T14:54:51.929Z',
  //       updatedAt: '2023-11-08T14:54:51.929Z',
  //     },
  //     {
  //       answerer: 'metamong',
  //       _id: '654ba1a2e9664d0e9b7a8304',
  //       createdAt: '2023-11-08T14:56:34.596Z',
  //       updatedAt: '2023-11-08T14:56:34.596Z',
  //     },
  //   ],
  //   description: 'answerList',
  //   required: true,
  // })
  // @Type(() => Answer)
  // @Expose()
  @Prop({
    type: [AnswerSchema],
  })
  answerList: Answer[];

  @Prop()
  // @Expose()
  // @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  createdAt: Date;

  @Prop()
  // @Expose()
  // @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  updatedAt: Date;
}

export const DiarySchema = SchemaFactory.createForClass(Diary);
