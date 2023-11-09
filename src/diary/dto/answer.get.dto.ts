import { ApiProperty } from '@nestjs/swagger';

export class AnswerGetDto {
  @ApiProperty({
    example: '644ba08d90664d0e9b7a82b7',
    description: '_id',
    required: true,
  })
  _id: string;

  @ApiProperty({
    example: {
      _id: '654ba08de9664d0e9b7a82f7',
      questioner: 'yoyoo',
      question: ['이름', '나이', '좋아하는 음식', '싫어하는 음식'],
    },
    description: 'question',
    required: true,
  })
  qustion: object;

  @ApiProperty({
    example: {
      answerer: 'yoon',
      answers: ['영석', '3', '연어', '연어'],
      _id: '654c72f38d9d9cef97ebf245',
      createdAt: '2023-11-09T05:49:39.080Z',
      updatedAt: '2023-11-09T05:49:39.080Z',
    },
    description: 'answer',
    required: true,
  })
  answer: object;
}
