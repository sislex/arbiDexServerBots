/**
 * Proxy WebSocket gateway — backwards-compatible /prices namespace.
 * Connects to arbiDexMarketData /store and re-emits 'dataChange' as 'priceChange'.
 *
 * Author: Aliaksei Razhnou
 */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { io, Socket as ClientSocket } from 'socket.io-client';

@WebSocketGateway({ cors: true, namespace: '/prices' })
export class PriceProxyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  /** clientId → upstream socket */
  private upstreams = new Map<string, ClientSocket>();

  afterInit() {
    console.log('🔌 PriceProxyGateway: WebSocket /prices ready (proxy → arbiDexMarketData /store)');
  }

  handleConnection(client: Socket) {
    console.log(`🔌 WS /prices connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.removeUpstream(client.id);
    console.log(`🔌 WS /prices disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload?: { keys?: string[] }) {
    const url = process.env.MARKET_DATA_URL;
    if (!url) {
      client.emit('error', { message: 'MARKET_DATA_URL not configured' });
      return;
    }

    // Clean up previous upstream if any
    this.removeUpstream(client.id);

    const upstream = io(`${url}/store`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    upstream.on('connect', () => {
      // Subscribe to same keys on upstream
      upstream.emit('subscribe', payload ?? {});
    });

    upstream.on('subscribed', (info: any) => {
      client.emit('subscribed', info);
    });

    upstream.on('dataChange', (data: { key: string; point: { t: number; v: number } }) => {
      // Re-emit as 'priceChange' for backwards compatibility
      client.emit('priceChange', data);
    });

    upstream.on('connect_error', (err: Error) => {
      console.error(`[PriceProxyGateway] upstream error for ${client.id}: ${err.message}`);
    });

    this.upstreams.set(client.id, upstream);

    const keys = payload?.keys;
    console.log(`🔌 WS /prices ${client.id} subscribed to ${keys?.length ? `${keys.length} keys` : 'ALL keys'} (via proxy)`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket) {
    this.removeUpstream(client.id);
    client.emit('unsubscribed', {});
    console.log(`🔌 WS /prices ${client.id} unsubscribed`);
  }

  private removeUpstream(clientId: string) {
    const upstream = this.upstreams.get(clientId);
    if (upstream) {
      upstream.disconnect();
      this.upstreams.delete(clientId);
    }
  }
}

