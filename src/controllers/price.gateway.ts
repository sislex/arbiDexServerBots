import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { priceStore, PricePoint } from '../jobs/shared';

/**
 * WebSocket Gateway для подписки на изменения цен в PriceStore.
 *
 * Клиент подключается и отправляет:
 *   { event: 'subscribe', data: { keys: ['binance|ETHUSDC|bidPrice', ...] } }
 *   — подписка на список ключей
 *
 *   { event: 'subscribe', data: {} }  или  { event: 'subscribe' }
 *   — подписка на ВСЕ ключи
 *
 *   { event: 'unsubscribe' }
 *   — отписка
 *
 * Сервер шлёт клиенту:
 *   { event: 'priceChange', data: { key, point: { timestamp, value } } }
 */
@WebSocketGateway({ cors: true, namespace: '/prices' })
export class PriceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  /** clientId → unsubscribe function */
  private unsubs = new Map<string, () => void>();

  afterInit() {
    console.log('🔌 PriceGateway: WebSocket /prices ready');
  }

  handleConnection(client: Socket) {
    console.log(`🔌 WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.removeSubscription(client.id);
    console.log(`🔌 WS disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload?: { keys?: string[] }) {
    // Убираем старую подписку если была
    this.removeSubscription(client.id);

    const keys = payload?.keys;

    const cb = (point: PricePoint, key: string) => {
      client.emit('priceChange', { key, point });
    };

    let unsub: () => void;

    if (keys && keys.length > 0) {
      // Подписка на список ключей
      unsub = priceStore.onPriceChangeMulti(keys, cb);
      client.emit('subscribed', { keys });
      console.log(`🔌 WS ${client.id} subscribed to ${keys.length} keys`);
    } else {
      // Подписка на все ключи
      unsub = priceStore.onAnyPriceChange(cb);
      client.emit('subscribed', { keys: 'all' });
      console.log(`🔌 WS ${client.id} subscribed to ALL keys`);
    }

    this.unsubs.set(client.id, unsub);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket) {
    this.removeSubscription(client.id);
    client.emit('unsubscribed', {});
    console.log(`🔌 WS ${client.id} unsubscribed`);
  }

  private removeSubscription(clientId: string) {
    const unsub = this.unsubs.get(clientId);
    if (unsub) {
      unsub();
      this.unsubs.delete(clientId);
    }
  }
}

