import { DataSource, DataSourceOptions } from 'typeorm';
import * as AllEntities from './helpers/entities/entities';

export class DBConnector {
  static async create(config: DataSourceOptions): Promise<DataSource> {
    const ds = new DataSource({
      ...config,
      entities: Object.values(AllEntities),
      synchronize: false,
      logging: false,
    });

    return await ds.initialize();
  }

  static async close(ds: DataSource | undefined): Promise<void> {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
  }
}
