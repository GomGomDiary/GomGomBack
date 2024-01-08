import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { MongoIdTransfrom } from 'src/common/decorators/mongoIdTransform.decorator';

export class HistoryIdDto {
  constructor(historyId: string | Types.ObjectId) {
    if (historyId instanceof Types.ObjectId) {
      this.historyId = historyId;
    } else {
      this.historyId = new Types.ObjectId(historyId);
    }
  }

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'historyId',
    required: true,
  })
  @IsNotEmpty()
  @MongoIdTransfrom()
  historyId: Types.ObjectId;
}
