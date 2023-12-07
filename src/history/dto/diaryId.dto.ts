import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class DiaryIdDto {
  constructor(diaryId: string | Types.ObjectId) {
    if (diaryId instanceof Types.ObjectId) {
      this.diaryId = diaryId;
    } else {
      this.diaryId = new Types.ObjectId(diaryId);
    }
  }

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'diaryId',
    required: true,
  })
  diaryId: Types.ObjectId;
}
