
import 'reflect-metadata';
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
   type: 'postgres',
    host: process.env.DB_HOST,  // now comes from docker-compose
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // Use migrations in production
    logging: true,
    entities: [__dirname + '/entities/*.{js,ts}'],
    migrations: [__dirname + '/migrations/*.{js,ts}'],
    installExtensions: true, // This enables CREATE EXTENSION support
};

console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
  dir: __dirname
});
export const AppDataSource = new DataSource(config);