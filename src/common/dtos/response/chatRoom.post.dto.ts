import { ApiProperty, PickType } from '@nestjs/swagger';
import { ChatRoomDto } from '../chatRoom.dto';
import { Expose } from 'class-transformer';

export class ChatRoomPostDto extends PickType(ChatRoomDto, ['_id']) {}
