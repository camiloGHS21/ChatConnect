import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './controllers/login.controller.js';
import { LoginRepository } from './repositories/login.repository.js';
import { DatabaseModule } from '../database/database.module.js';
import { EmpresaModel, UsuarioModel } from './models/login.model.js';

import { CsrfGuard } from './guards/csrf.guard.js';

/**
 * ============================================================================
 * MÓDULO DE LOGIN (Controller ──► Repository)
 * ============================================================================
 * Estructura simplificada sin capas intermedias:
 * - LoginController: Expone endpoints y gestiona el flujo de login.
 * - LoginRepository: Maneja consultas TypeORM a PostgreSQL.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    DatabaseModule,
    TypeOrmModule.forFeature([EmpresaModel, UsuarioModel]),
  ],
  controllers: [LoginController],
  providers: [
    LoginRepository,
    CsrfGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [LoginRepository, CsrfGuard],
})
export class LoginModule {}
