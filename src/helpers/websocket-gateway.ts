import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { quoteEvents } from '../jobs/setQuotesGraphData/helpers/events';

interface PairTokens {
  token0Id: number;
  token1Id: number;
}

interface SubscriptionItem {
  chain: number;
  pairs: PairTokens[];
}

export interface IQuoteDataFull {
  chainId: number;
  token0Id: number;
  token1Id: number;
  costBuy: string | bigint;
  costSell: string | bigint;
  timestamp: Date;
}

@WebSocketGateway(8080)
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private subscriptions = new Map<WebSocket, Map<number, Set<string>>>();

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: WebSocket, @MessageBody() rawData: any) {
    const data: SubscriptionItem[] = rawData.data || rawData;

    if (!Array.isArray(data)) {
      console.error('Ошибка: данные подписки не являются массивом', data);
      return;
    }

    let clientSub = this.subscriptions.get(client);
    if (!clientSub) {
      clientSub = new Map<number, Set<string>>();
      this.subscriptions.set(client, clientSub);
    }

    data.forEach((item) => {
      const chainId = Number(item.chain);
      let pairSet = clientSub.get(chainId);
      if (!pairSet) {
        pairSet = new Set<string>();
        clientSub.set(chainId, pairSet);
      }

      item.pairs.forEach((p) => {
        const pairKey = `${Number(p.token0Id)}-${Number(p.token1Id)}`;
        pairSet.add(pairKey);
      });
    });

    // Отправляем подтверждение клиенту
    if (client && typeof client.send === 'function') {
      const confirmMessage = JSON.stringify({ event: 'subscribe_confirm', status: 'success' });
      client.send(confirmMessage);
    }
  }

  private broadcast(updates: IQuoteDataFull[]) {
    if (!this.server || !Array.isArray(updates) || updates.length === 0) return;

    this.server.clients.forEach((client: WebSocket) => {
      const clientSub = this.subscriptions.get(client);
      if (!clientSub) return;

      updates.forEach((update) => {
        const cid = Number(update.chainId);
        const updateKey = `${Number(update.token0Id)}-${Number(update.token1Id)}`;
        const pairsInChain = clientSub.get(cid);
        if (pairsInChain?.has(updateKey) && client.readyState === 1) {
          const message = JSON.stringify(
            { event: 'quotes_update', data: update },
            (_, v) => (typeof v === 'bigint' ? v.toString() : v),
          );

          client.send(message);
        }
      });
    });
  }

  afterInit() {
    quoteEvents.on('quotes_updated', (data) => {
      this.broadcast(data);
    });
  }

  handleDisconnect(client: WebSocket) {
    this.subscriptions.delete(client);
  }
}