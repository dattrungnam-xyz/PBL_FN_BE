import {
  DataSource,
  DataSourceOptions,
  DefaultNamingStrategy,
  NamingStrategyInterface,
} from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
  dropSchema: false,

};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
