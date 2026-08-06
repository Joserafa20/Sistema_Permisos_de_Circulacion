import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

/**
 * DataSource independiente para el CLI de TypeORM.
 * Usado exclusivamente por los scripts de migración en package.json.
 * La conexión en runtime se gestiona a través de TypeOrmModule en app.module.ts.
 */
const host = process.env.DB_HOST ?? 'localhost';
const isRemote = !host.includes('localhost') && !host.includes('127.0.0.1');

export default new DataSource({
  type: 'postgres',
  host,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SCHEMA ?? 'public',
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  entities: [join(__dirname, '..', 'modules', '**', '*.entity.ts')],
  migrations: [join(__dirname, '..', '..', 'database', 'migrations', '*.ts')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
