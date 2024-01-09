import { ApiProperty, PickType } from '@nestjs/swagger';
import { ChatRoomDto } from '../chatRoom.dto';
import { Expose } from 'class-transformer';

export class ChatRoomPostDto extends PickType(ChatRoomDto, [
  '_id',
  'questionerId',
  'answererId',
]) {
  @ApiProperty({
    example: '2023-11-08T14:54:51.929Z',
    description: 'createdAt',
    required: true,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2023-11-08T14:54:51.929Z',
    description: 'updatedAt',
    required: true,
  })
  @Expose()
  updatedAt: Date;
}
