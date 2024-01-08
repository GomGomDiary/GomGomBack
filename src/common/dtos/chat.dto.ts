import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { Chat } from 'src/models/chat.schema';
import { MongoIdTransfrom } from '../decorators/mongoIdTransform.decorator';
import { TransformObjectIdToString } from '../decorators/transformObjectIdToString.decorator';

// value.obj.* -> value.key 변환
export class ChatDto extends Chat {
  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'roomId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @MongoIdTransfrom({ toClassOnly: true })
  @TransformObjectIdToString('', { toPlainOnly: true })
  @Expose()
  @IsNotEmpty()
  roomId: Types.ObjectId;

  @ApiProperty({
    example: '634ba08de9664d0e9b7a82f8',
    description: 'clientId',
    required: true,
  })
  @Type(() => Types.ObjectId)
  @Transform(
    (value) => {
      return value.obj[value.key];
    },
    { toClassOnly: true },
  )
  @MongoIdTransfrom({ toClassOnly: true })
  @TransformObjectIdToString('', { toPlainOnly: true })
  @Expose()
  @IsNotEmpty()
  clientId: Types.ObjectId;

  @ApiProperty({
    example: 'yoyoo',
    description: 'nickname',
    required: true,
  })
  @Expose()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    example: '난너를믿었던만큼내친구도믿었기에',
    description: 'chat',
    required: true,
  })
  @Expose()
  @IsNotEmpty()
  chat: string;
}
