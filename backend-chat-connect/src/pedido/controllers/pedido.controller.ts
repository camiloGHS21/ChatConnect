import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PedidoRepository } from '../repositories/pedido.repository.js';

/**
 * ============================================================================
 * CONTROLADOR DE PEDIDOS (Solo Lectura / Read-Only ──► PostgreSQL)
 * ============================================================================
 * Expone exclusivamente endpoints de consulta y visualización de pedidos.
 * Protegido contra modificaciones o eliminaciones desde la API.
 */
@Controller(['pedidos', 'pedido'])
export class PedidoController {
  constructor(private readonly pedidoRepo: PedidoRepository) {}

  /**
   * GET /pedidos | GET /pedido
   * Lista pedidos formalizados con filtros opcionales de estado o búsqueda.
   */
  @Get()
  async listar(
    @Query('empresa_id') empresaId?: string,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.pedidoRepo.listar(idEmpresa, { estado, search });
  }

  /**
   * GET /pedidos/kpis | GET /pedido/kpis
   * Retorna métricas en tiempo real para las tarjetas KPI de la vista de pedidos.
   */
  @Get('kpis')
  async obtenerKpis(@Query('empresa_id') empresaId?: string) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.pedidoRepo.obtenerKpis(idEmpresa);
  }

  /**
   * GET /pedidos/:id | GET /pedido/:id
   * Obtiene el detalle completo de un pedido con sus ítems cotizados.
   */
  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @Query('empresa_id') empresaId?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.pedidoRepo.obtenerPorId(id, idEmpresa);
  }
}
