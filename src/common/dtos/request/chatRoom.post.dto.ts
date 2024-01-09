import { PickType } from '@nestjs/swagger';
import { ChatRoomDto } from '../chatRoom.dto';

export class CreateChatRoomDto extends PickType(ChatRoomDto, ['answererId']) {}
