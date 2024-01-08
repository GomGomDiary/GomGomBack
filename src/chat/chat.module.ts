import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from 'src/models/chat.schema';
import { ChatRepository } from 'src/common/repositories/chat.repository';
import { ChatRoomSchema } from 'src/models/chatRoom.schema';
import { ChatMessageController } from './message/message.controller';
import { ChatMessageService } from './message/message.service';
import { ChatMessageRepository } from 'src/common/repositories/message.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema },
      {
        name: 'ChatRoom',
        schema: ChatRoomSchema,
      },
    ]),
  ],
  providers: [
    ChatService,
    ChatGateway,
    ChatRepository,
    ChatMessageService,
    ChatMessageRepository,
  ],
  controllers: [ChatController, ChatMessageController],
})
export class ChatModule {}
