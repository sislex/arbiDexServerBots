import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuoteBroadcasterService } from './quote-broadcaster.service';
import type { PoolValue } from '../jobs/shared/quote-write-points';

@WebSocketGateway({ namespace: '/store', cors: { origin: '*' } })
export class StoreGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly subscriptions = new Map<string, () => void>();
  private readonly clientKeys = new Map<string, string[] | 'all' | null>();

  constructor(private readonly broadcaster: QuoteBroadcasterService) {}

  handleConnection(client: Socket): void {
    this.clientKeys.set(client.id, null);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload?: { keys?: string[] }): void {
    this.subscriptions.get(client.id)?.();

    const keys = payload?.keys;
    if (!keys || keys.length === 0) {
      const unsub = this.broadcaster.onAnyChange((key, point) => {
        client.emit('dataChange', { key, point });
      });
      this.subscriptions.set(client.id, unsub);
      this.clientKeys.set(client.id, 'all');
      client.emit('subscribed', { keys: 'all' });
      return;
    }

    const unsub = this.broadcaster.onChangeMulti(keys, (key, point) => {
      client.emit('dataChange', { key, point });
    });
    this.subscriptions.set(client.id, unsub);
    this.clientKeys.set(client.id, keys);
    client.emit('subscribed', { keys });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket): void {
    this.subscriptions.get(client.id)?.();
    this.subscriptions.delete(client.id);
    this.clientKeys.set(client.id, null);
    client.emit('unsubscribed', {});
  }

  @SubscribeMessage('write')
  handleWrite(
    _client: Socket,
    payload?: { key?: string; value?: number | PoolValue; timestamp?: number },
  ): void {
    if (typeof payload?.key !== 'string' || payload.value === undefined) return;
    this.broadcaster.publishPoint({
      key: payload.key,
      value: payload.value,
      timestamp: payload.timestamp,
    });
  }

  handleDisconnect(client: Socket): void {
    this.subscriptions.get(client.id)?.();
    this.subscriptions.delete(client.id);
    this.clientKeys.delete(client.id);
  }
}
