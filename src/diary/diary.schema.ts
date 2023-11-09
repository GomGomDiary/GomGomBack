import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SchemaOptions, Document } from 'mongoose';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Answer extends Document {
  @ApiProperty({
    example: ['answer1', 'answer2', 'answer3'],
    description: 'answer list',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop()
  answerer: string;

  @ApiProperty({
    example: 'yoyoo',
    description: 'nickname',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @Prop()
  answers: string[];
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema(options)
export class Diary extends Document {
  @ApiProperty({
    example: ['question1', 'question2', 'question3'],
    description: 'question list',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @Prop()
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
  questioner: string;

  @ApiProperty({
    example: '내 생일',
    description: '암호',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop()
  challenge: string;

  @ApiProperty({
    example: '0120',
    description: '암호에 대한 답',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Prop()
  countersign: string;

  @ApiProperty({
    example: [
      {
        answerer: 'yoon',
        _id: '654ba13be9664d0e9b7a82fa',
        createdAt: '2023-11-08T14:54:51.929Z',
        updatedAt: '2023-11-08T14:54:51.929Z',
        isPermission: false,
      },
      {
        answerer: 'metamong',
        _id: '654ba1a2e9664d0e9b7a8304',
        createdAt: '2023-11-08T14:56:34.596Z',
        updatedAt: '2023-11-08T14:56:34.596Z',
        isPermission: false,
      },
    ],
    description: 'answerList',
    required: true,
  })
  @Prop({
    type: [AnswerSchema],
  })
  answerList: Answer[];
}

export const DiarySchema = SchemaFactory.createForClass(Diary);
