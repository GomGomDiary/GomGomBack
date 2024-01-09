import { Types } from 'mongoose';
import { ChatRoom } from 'src/models/chatRoom.schema';
import { TransformObjectId } from '../decorators/mongoIdTransform.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ChatRoomDto extends ChatRoom {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: '_id (roomId)',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectId()
  @Expose()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'questionerId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectId()
  @Expose()
  @IsNotEmpty()
  questionerId: Types.ObjectId;

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'answererId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformObjectId()
  @Expose()
  @IsNotEmpty()
  answererId: Types.ObjectId;
}
