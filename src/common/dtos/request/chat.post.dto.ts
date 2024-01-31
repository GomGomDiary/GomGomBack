import { PickType } from '@nestjs/swagger';
import { ChatDto } from '../chat.dto';

export class CreateChatMessageDto extends PickType(ChatDto, [
  'roomId',
  'nickname',
  'chat',
]) {}
