import { Injectable, OnModuleInit } from '@nestjs/common';
import { priceStore, PricePoint } from '../jobs/shared';

/**
 * При старте сервера подписывается на все изменения цен в PriceStore
 * и выводит их в консоль.
 *
 * Подключается в AppModule → providers.
 */
@Injectable()
export class PriceWatcherService implements OnModuleInit {
  onModuleInit() {
    priceStore.onAnyPriceChange((point: PricePoint, key: string) => {
      console.log(`📈 ${key}  →  ${point.value}  (${new Date(point.timestamp).toISOString()})`);
    });

    console.log('👀 PriceWatcherService: подписка на все изменения цен активна');
  }
}

