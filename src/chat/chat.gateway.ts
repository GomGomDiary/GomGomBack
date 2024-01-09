import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DiaryIdDto } from 'src/common/dtos/request/diaryId.dto';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  // 1. handleConnection을 통해서 사용자 인증 및 정보 가져오기
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  @SubscribeMessage('enter_chat')
  async enterChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: DiaryIdDto,
  ) {
    // 2. socket.user를 통해 roomId 조회
    // 있다면 -> 방 입장
    // 없다면 -> reject

    // 채팅방은 오직 diary 주인만이 생성할 수 있음
    // const isRoomExist = await this.chatService.exist(dto.diaryId);

    // TODO dto.diaryId -> socket.user로 수정
    // if (!isRoomExist) {
    //   throw new WsException('채팅방이 존재하지 않습니다.');
    // }

    console.log(dto.diaryId);
    socket.join(dto.diaryId.toString());
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    // 2. socket.user를 통해 roomId 조회
    // 없다면 -> 에러처리
    // 있다면 -> await this.chatMessageService.createMessage();
    //           socket.to().emit()

    socket.to('1').emit('receive_message', 'hello');
  }
}
