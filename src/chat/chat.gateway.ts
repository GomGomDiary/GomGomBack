import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DiaryIdDto } from 'src/common/dtos/request/diaryId.dto';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway {
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  @SubscribeMessage('create_chat')
  createChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DiaryIdDto,
  ) {
    // data.diaryId의 방이 존재하는지 체크
    // 없다면 -> 방 생성
    // 있다면 -> 방 입장
    console.log(data.diaryId);
    socket.join('1');
    return 'Hello world!';
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DiaryIdDto,
  ) {
    // data.diaryId의 방이 존재하는지 체크
    // 없다면 -> 방 생성
    // 있다면 -> 방 입장
    console.log(data.diaryId);
    socket.join(data.diaryId.toString());
    return 'Hello world!';
  }

  @SubscribeMessage('send_message')
  sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    socket.to('1').emit('receive_message', 'hello');
  }
}
