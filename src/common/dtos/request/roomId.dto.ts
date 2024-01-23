import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { TransformObjectId } from 'src/common/decorators/mongoIdTransform.decorator';

export class RoomIdDto {
  constructor(roomId: string | Types.ObjectId) {
    if (roomId instanceof Types.ObjectId) {
      this.roomId = roomId;
    } else {
      this.roomId = new Types.ObjectId(roomId);
    }
  }

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'roomId',
    required: true,
  })
  @IsNotEmpty()
  @TransformObjectId()
  roomId: Types.ObjectId;
}
