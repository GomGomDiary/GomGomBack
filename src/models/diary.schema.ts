import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SchemaOptions, Document, Types } from 'mongoose';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { KOREAN_TIME_DIFF } from 'src/utils/constants';
import { toKoreaTime } from 'src/utils/toKoreaTime';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Answer {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'id',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectIdToString('_id', { toPlainOnly: true })
  @Transform((value) => value.obj._id, { toClassOnly: true })
  @Expose()
  _id: Types.ObjectId;

  @ApiProperty({
    example: 'yoyoo',
    description: 'nickname',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop()
  @Expose()
  answerer: string;

  @ApiProperty({
    example: ['answer1', 'answer2', 'answer3'],
    description: 'answer list',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @Prop()
  @Expose()
  answers: string[];

  @ApiProperty({
    example: '2022-01-01T00:00:00.000',
    description: 'createdAt',
  })
  @Prop()
  @Expose()
  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  createdAt: Date;

  @Prop()
  @Expose()
  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  updatedAt: Date;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

export type DiaryDocumentType = Omit<Diary, keyof Document>;

@Schema(options)
export class Diary {
  @ApiProperty({
    example: '654ba08de9664d0e9b7a82f7',
    description: 'id',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectIdToString('_id', { toPlainOnly: true })
  @Transform((value) => value.obj._id, { toClassOnly: true })
  @Expose()
  _id: Types.ObjectId;

  @ApiProperty({
    example: ['question1', 'question2', 'question3'],
    description: 'question list',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @Prop()
  @Expose()
  question: string[];

  @ApiProperty({
    example: 'yoyoo',
    description: 'nickname',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop({
    required: true,
  })
  @Expose()
  questioner: string;

  @ApiProperty({
    example: '내 생일',
    description: '암호',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop()
  @Expose()
  challenge: string;

  @ApiProperty({
    example: '0120',
    description: '암호에 대한 답',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop()
  @Exclude({ toPlainOnly: true })
  countersign: string;

  @ApiProperty({
    example: [
      {
        answerer: 'yoon',
        _id: '654ba13be9664d0e9b7a82fa',
        createdAt: '2023-11-08T14:54:51.929Z',
        updatedAt: '2023-11-08T14:54:51.929Z',
      },
      {
        answerer: 'metamong',
        _id: '654ba1a2e9664d0e9b7a8304',
        createdAt: '2023-11-08T14:56:34.596Z',
        updatedAt: '2023-11-08T14:56:34.596Z',
      },
    ],
    description: 'answerList',
    required: true,
  })
  @Prop({
    type: [AnswerSchema],
  })
  @Type(() => Answer)
  @Expose()
  answerList: Answer[];

  @Prop()
  @Expose()
  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  createdAt: Date;

  @Prop()
  @Expose()
  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  updatedAt: Date;
}

export const DiarySchema = SchemaFactory.createForClass(Diary);
