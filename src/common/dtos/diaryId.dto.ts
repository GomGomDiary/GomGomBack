import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { MongoIdTransfrom } from 'src/common/decorators/mongoIdTransform.decorator';

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
  @MongoIdTransfrom()
  diaryId: Types.ObjectId;
}
