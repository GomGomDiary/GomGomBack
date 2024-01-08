import { PickType } from '@nestjs/swagger';
import { ChatDto } from '../chat.dto';

export class CreateChatDto extends PickType(ChatDto, [
  'roomId',
  'nickname',
  'chat',
]) {}
