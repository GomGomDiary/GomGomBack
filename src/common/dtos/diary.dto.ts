import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { toKoreaTime } from 'src/utils/toKoreaTime';
import { TransformObjectId } from '../decorators/mongoIdTransform.decorator';
import { Answer } from 'src/models/diary.schema';

export class AnswerDto extends Answer {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'id',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectId()
  @Expose()
  _id: Types.ObjectId;

  @ApiProperty({
    example: 'yoyoo',
    description: 'nickname',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  @Expose()
  answerer: string;

  @ApiProperty({
    example: ['answer1', 'answer2', 'answer3'],
    description: 'answer list',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  @Expose()
  answers: string[];

  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  @Expose()
  createdAt: Date;

  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: Date;

  @Transform(
    ({ value }) => {
      if (!value) return;
      return value.toString();
    },
    { toPlainOnly: true },
  )
  @Expose()
  roomId?: Types.ObjectId;
}

export class DiaryDto {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'id',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectId()
  @Expose()
  _id: Types.ObjectId;

  @ApiProperty({
    example: ['question1', 'question2', 'question3'],
    description: 'question list',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  @Expose()
  question: string[];

  @ApiProperty({
    example: 'yoyoo',
    description: 'nickname',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  @Expose()
  questioner: string;

  @ApiProperty({
    example: '내 생일',
    description: '암호',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  @Expose()
  challenge: string;

  @ApiProperty({
    example: '0120',
    description: '암호에 대한 답',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  @Exclude({ toPlainOnly: true })
  @Expose()
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
  @Type(() => AnswerDto)
  @Expose()
  answerList: AnswerDto[];

  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  @Expose()
  createdAt: Date;

  @Transform(({ value }) => toKoreaTime(value), { toPlainOnly: true })
  @Expose()
  updatedAt: Date;
}
