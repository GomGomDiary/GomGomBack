import { Types } from 'mongoose';
import { ChatRoom } from 'src/models/chatRoom.schema';
import { TransformStringToObjectId } from '../decorators/mongoIdTransform.decorator';
import { TransformObjectIdToString } from '../decorators/transformObjectIdToString.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ChatRoomDto extends ChatRoom {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: '_id (roomId)',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformStringToObjectId({ toClassOnly: true })
  @TransformObjectIdToString('', { toClassOnly: true }) // plainToInstance라서 class에서 동작해야함
  @Expose()
  @IsNotEmpty()
  _id: Types.ObjectId;
  // @ApiProperty({
  //   example: '634ba08de9664d0e9b7a82f8',
  //   description: 'roomId',
  //   required: true,
  // })
  // @Type(() => Types.ObjectId)
  // @TransformStringToObjectId({ toClassOnly: true })
  // @TransformObjectIdToString('', { toPlainOnly: true })
  // @Expose()
  // @IsNotEmpty()
  // roomId: Types.ObjectId;

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'questionerId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformStringToObjectId({ toClassOnly: true })
  @TransformObjectIdToString('', { toClassOnly: true })
  @Expose()
  @IsNotEmpty()
  questionerId: Types.ObjectId;

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'answererId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @TransformStringToObjectId({ toClassOnly: true })
  @TransformObjectIdToString('', { toClassOnly: true })
  @Expose()
  @IsNotEmpty()
  answererId: Types.ObjectId;
}
