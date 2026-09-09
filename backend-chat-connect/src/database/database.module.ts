import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

/**
 * Módulo Global de Base de Datos.
 *
 * Al estar decorado con `@Global()`, cualquier otro módulo (LoginModule, etc.)
 * puede inyectar `DatabaseService` directamente sin necesidad de volver a importarlo en sus `imports`.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

