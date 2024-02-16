import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from 'src/models/chat.schema';
import { ChatRepository } from 'src/chat/chat.repository';
import { ChatRoomSchema } from 'src/models/chatRoom.schema';
import { ChatMessageController } from './message/message.controller';
import { ChatMessageService } from './message/message.service';
import { ChatMessageRepository } from 'src/chat/message/message.repository';
import { DiaryModule } from 'src/diary/diary.module';
import { DiarySchema } from 'src/models/diary.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema },
      {
        name: 'ChatRoom',
        schema: ChatRoomSchema,
      },
      {
        name: 'Diary',
        schema: DiarySchema,
      },
    ]),
    DiaryModule,
    AuthModule,
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
