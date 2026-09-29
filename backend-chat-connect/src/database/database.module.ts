import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { DatabaseService } from './database.service.js';
import { SeedService } from './seed.service.js';
import { EmpresaModel, UsuarioModel } from '../login/models/login.model.js';

dotenv.config();

/**
 * ============================================================================
 * MÓDULO GLOBAL DE BASE DE DATOS (TYPEORM)
 * ============================================================================
 * Configura la conexión centralizada con PostgreSQL a través de TypeORM:
 * - `synchronize: false`: Protege de modificaciones destructivas el esquema en PostgreSQL.
 * - `autoLoadEntities: true`: Carga entidades registradas mediante `TypeOrmModule.forFeature`.
 * - Exporta `TypeOrmModule`, `DatabaseService` y `SeedService` globalmente.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'chatbotDatabase',
        entities: [EmpresaModel, UsuarioModel],
        autoLoadEntities: true,
        synchronize: false, // ¡ESTRICTO!: Nunca alterar o sobrescribir tablas en la base de datos
        logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
        retryAttempts: 10,
        retryDelay: 3000,
        extra: {
          max: 20,
          idleTimeoutMillis: 60000,
          connectionTimeoutMillis: 30000,
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
        },
      }),
    }),
    TypeOrmModule.forFeature([EmpresaModel, UsuarioModel]),
  ],
  providers: [DatabaseService, SeedService],
  exports: [TypeOrmModule, DatabaseService, SeedService],
})
export class DatabaseModule {}
