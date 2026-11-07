import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { Category } from '../entities/category.entity';

/**
 * Конфигурация БД через переменные окружения.
 * DB_TYPE=postgres (по умолчанию, в Docker) или sqljs (локальная разработка без Postgres).
 */
export function buildTypeOrmOptions(): TypeOrmModuleOptions {
  const base = {
    entities: [User, Listing, Category],
    synchronize: true,
  };

  if (process.env.DB_TYPE === 'sqljs') {
    return {
      ...base,
      type: 'sqljs',
      autoSave: true,
      location: process.env.SQLJS_LOCATION || 'buynet.dev.db',
    } as TypeOrmModuleOptions;
  }

  return {
    ...base,
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'buynet',
    password: process.env.DB_PASSWORD || 'buynet',
    database: process.env.DB_NAME || 'buynet',
  } as TypeOrmModuleOptions;
}
