import { DataSource, DataSourceOptions, EntityManager } from 'typeorm';
import { DBConnector } from '../../getPoolsFromFactory/dbConnector';

interface ExtraSettings {
  configData: Record<string, any>;
  configDB: DataSourceOptions;
}

export async function runWithContext<T, R>(
  extraSettings: string | ExtraSettings | undefined,
  initServices: (manager: EntityManager) => T,
  callback: (ctx: {
    manager: EntityManager;
    configData: any;
    services: T;
  }) => Promise<R>,
): Promise<R | { success: false; error: string }> {
  let parsedSettings: ExtraSettings;

  try {
    if (typeof extraSettings === 'string') {
      parsedSettings = JSON.parse(extraSettings) as ExtraSettings;
    } else if (extraSettings && typeof extraSettings === 'object') {
      parsedSettings = extraSettings;
    } else {
      throw new Error('Settings are missing');
    }

    if (!parsedSettings?.configData || !parsedSettings?.configDB) {
      throw new Error('Missing configData or configDB');
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('!!! Invalid extraSettings JSON', message);
    return { success: false, error: 'Invalid extraSettings JSON' };
  }

  const { configData, configDB } = parsedSettings;
  let dataSource: DataSource | undefined;

  try {
    dataSource = await DBConnector.create(configDB);
    const manager = dataSource.manager;
    const services = initServices(manager);

    return await callback({
      manager,
      configData,
      services,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('!!! EXECUTION ERROR:', message);
    throw error;
  } finally {
    if (dataSource) {
      await DBConnector.close(dataSource);
    }
  }
}
