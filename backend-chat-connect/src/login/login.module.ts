import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoginController } from './controllers/login.controller.js';
import { LoginService } from './services/login.service.js';
import { DatabaseModule } from '../database/database.module.js';


/**
 * Módulo de Autenticación y Login de ChatConnect CRM.
 *
 * Responsabilidades:
 * - Proporciona el controlador de inicio de sesión (`LoginController`).
 * - Expone el servicio de autenticación con Bcrypt y JWT (`LoginService`).
 * - Aplica limitación de tasa (Rate Limiting) global mediante `ThrottlerGuard` y `@nestjs/throttler`.
 *   Por defecto: límite de 30 peticiones cada 60 segundos por IP.
 * - Integra el módulo de acceso a datos (`DatabaseModule`).
 */
@Module({
  imports: [
    // Rate Limiting oficial de NestJS: https://docs.nestjs.com/security/rate-limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Ventana de tiempo: 60.000 ms (1 minuto)
        limit: 30,  // Máximo 30 peticiones por minuto por IP por defecto
      },
    ]),
    DatabaseModule,
  ],
  controllers: [LoginController],
  providers: [
    LoginService,
    {
      // Aplica el guardián de limitación de tasa de forma global a todos los endpoints del módulo
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [LoginService],
})
export class LoginModule {}

