import { PickType } from '@nestjs/swagger';
import { ChatRoomDto } from '../chatRoom.dto';

export class ChatRoomPostDto extends PickType(ChatRoomDto, ['_id']) {}
