import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DiaryIdDto } from 'src/common/dtos/request/diaryId.dto';
import { ChatService } from './chat.service';
import { ChatMessageService } from './message/message.service';
import { AuthService } from 'src/auth/auth.service';
import { ChatRepository } from 'src/common/repositories/chat.repository';
import { Types } from 'mongoose';
import { CreateChatMessageDto } from 'src/common/dtos/request/chat.post.dto';
import { EnterChatDto } from 'src/common/dtos/request/enter.chat.dto';

@WebSocketGateway({
  namespace: 'chat',
  cookie: true,
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatMessageService: ChatMessageService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(socket: Socket & { user: string }) {
    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];
    if (!rawToken) {
      return socket.disconnect();
    }
    const roomId = headers['roomid'];
    if (!roomId || Array.isArray(roomId) || !Types.ObjectId.isValid(roomId)) {
      return socket.disconnect();
    }
    const token = this.authService.extractTokenFromHeader(rawToken);
    const payload = await this.authService.verifyToken(token);
    const clientId = payload.sub;
    const chatRoom = await this.chatRepository.findChatRoom(
      new Types.ObjectId(clientId),
      new Types.ObjectId(roomId),
    );
    if (!chatRoom) {
      return socket.disconnect();
    }
    socket.user = clientId;
    return true;
  }

  // 1. handleConnection을 통해서 사용자 인증 및 정보 가져오기
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  @SubscribeMessage('enter_room')
  async enterChat(
    @ConnectedSocket() socket: Socket & { user: string },
    @MessageBody() data: EnterChatDto,
  ) {
    const chatExists = await this.chatRepository.findChatRoom(
      new Types.ObjectId(socket.user),
      data.roomId,
    );
    if (!chatExists) {
      throw new WsException(`채팅방이 존재하지 않습니다.`);
    }
    socket.join(data.roomId.toString());
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() socket: Socket & { user: string },
    @MessageBody() data: CreateChatMessageDto,
  ) {
    const chatExists = await this.chatRepository.findChatRoom(
      new Types.ObjectId(socket.user),
      data.roomId,
    );
    if (!chatExists) {
      throw new WsException(`채팅방이 존재하지 않습니다.`);
    }
    await this.chatMessageService.createMessage(
      new Types.ObjectId(socket.user),
      data,
    );
    socket.to(data.roomId.toString()).emit('receive_message', {
      chat: data.chat,
      nickname: data.nickname,
    });
  }
}
