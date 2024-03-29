import { Expose } from 'class-transformer';
import { ChatDto } from '../chat.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class CreateMessageDto extends OmitType(ChatDto, ['_id']) {
  @ApiProperty({
    example: '2023-11-08T14:54:51.929Z',
    description: 'createdAt',
    required: true,
  })
  @Expose()
  createdAt: Date;
}
