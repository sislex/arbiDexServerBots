import { config } from 'dotenv';
import { QuotesGraph } from '../jobs/setQuotesGraphData/helpers/entities/entities/QuotesGraph';

config();

console.log('DEBUG: Password is:', process.env.POSTGRES_PASSWORD);
export const DB_CONFIGS = {
  client_1: {
    configData: { name: 'First Client' },
    configDB: {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT_ANALYTICS || '6543', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB_ANALYTICS,
      entities: [QuotesGraph],
      synchronize: false,
    },
  },
};
