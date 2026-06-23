import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

config({ path: resolve(__dirname, '../../.env') });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, './migrations/*{.ts,.js}')],
  ssl: {
    rejectUnauthorized: false,
  },
});
