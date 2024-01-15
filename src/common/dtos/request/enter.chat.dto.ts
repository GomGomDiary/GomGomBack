import { PickType } from '@nestjs/swagger';
import { ChatDto } from '../chat.dto';

export class EnterChatDto extends PickType(ChatDto, ['roomId']) {}
