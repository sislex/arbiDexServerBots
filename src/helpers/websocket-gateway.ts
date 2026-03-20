import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';

@WebSocketGateway(8080) // Отдельный порт для WS
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any) {
    console.log('Пришло:', data);
    return { event: 'message', data: 'Эхо: ' + data };
  }
}
