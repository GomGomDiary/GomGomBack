import { ApiProperty, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { ChatDto } from '../chat.dto';

export class MessageGetDto extends PickType(ChatDto, [
  '_id',
  'nickname',
  'chat',
  'createdAt',
  'clientId',
]) {
  @ApiProperty({
    example: true,
  })
  @Expose()
  isSender: boolean;
}

export class MessageGetListDto {
  @ApiProperty({
    example: [
      {
        _id: '659d5a66b055dfd3fbbb4c16',
        clientId: '659d5a66b055dfd3fbbb4c15',
        nickname: 'nickname',
        chat: 'chat',
        createdAt: '2024-01-09T14:38:30.450Z',
      },
      {
        _id: '659d5a63b055dfd3fbbb4c11',
        clientId: '659d5a66b055dfd3fbbb4c10',
        nickname: 'nickname',
        chat: 'chat',
        createdAt: '2024-01-09T14:38:27.534Z',
      },
    ],
  })
  @Expose()
  @Type(() => MessageGetDto)
  messageList: MessageGetDto[];

  @ApiProperty({
    example: '659d5a66b055dfd3fbbb4c10',
  })
  @Expose()
  @Type(() => Types.ObjectId)
  // @TransformObjectId()
  @TransformObjectIdToString('', { toPlainOnly: true })
  @Transform(
    (value) => {
      // console.log('===');
      return value.obj.next;
    },
    { toClassOnly: true },
  )
  next: Types.ObjectId;
}
