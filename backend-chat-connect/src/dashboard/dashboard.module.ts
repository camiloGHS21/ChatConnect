import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DashboardController } from './controllers/dashboard.controller.js';
import { DashboardRepository } from './repositories/dashboard.repository.js';
import { DashboardOperacionRepository } from './repositories/dashboard-operacion.repository.js';
import { DashboardChatRepository } from './repositories/dashboard-chat.repository.js';

/**
 * ============================================================================
 * MÓDULO DE DASHBOARD (Controller ──► Repository ──► PostgreSQL)
 * ============================================================================
 * Registra la fachada y los sub-repositorios especializados del panel de
 * inicio, sin capa Service intermedia (RULE 1 y RULE 3).
 */
@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [
    DashboardRepository,
    DashboardOperacionRepository,
    DashboardChatRepository,
  ],
  exports: [DashboardRepository],
})
export class DashboardModule {}
