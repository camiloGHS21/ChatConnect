import { Controller, Get, Query } from '@nestjs/common';
import { DashboardRepository } from '../repositories/dashboard.repository.js';

/**
 * ============================================================================
 * CONTROLADOR DEL PANEL DE INICIO (Controller ──► Repository ──► PostgreSQL)
 * ============================================================================
 * Expone el resumen consolidado con datos reales de la base de datos.
 */
@Controller(['dashboard', 'inicio'])
export class DashboardController {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  /**
   * GET /dashboard | GET /inicio
   * Retorna el resumen del panel: KPIs, automatización IA, series mensuales,
   * últimos pedidos, zonas de entrega, canales de atención y top productos.
   */
  @Get()
  async obtenerResumen(@Query('empresa_id') empresaId?: string) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.dashboardRepo.obtenerResumen(idEmpresa);
  }
}
