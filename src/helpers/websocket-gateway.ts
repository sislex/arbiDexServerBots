import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { quoteEvents } from '../jobs/setQuotesGraphData/helpers/events';

@WebSocketGateway(8080)
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    quoteEvents.on('quotes_updated', (data) => {
      console.log(data);

      this.broadcast(data);
    });
  }

  private broadcast(data: any) {
    if (!this.server) return;

    try {
      const message = JSON.stringify(
        { event: 'quotes_update', data },
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      );

      console.log('Отправка сообщения клиентам...');

      this.server.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Ошибка при сериализации данных для WS:', error);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any) {
    return { event: 'message', data: 'Эхо: ' + data };
  }
}
