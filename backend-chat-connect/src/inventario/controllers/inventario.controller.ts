import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { InventarioRepository } from '../repositories/inventario.repository.js';
import { AjustarStockDto } from '../dto/ajustar-stock.dto.js';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioRepo: InventarioRepository) {}

  /**
   * GET /inventario
   * Lista todos los productos y su disponibilidad en inventario.
   */
  @Get()
  async listar(
    @Query('empresa_id') empresaId?: string,
    @Query('search') search?: string,
    @Query('filter') filterLevel?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.inventarioRepo.listar(idEmpresa, { search, filterLevel });
  }

  /**
   * GET /inventario/kpis
   * Retorna métricas globales de existencias, reservas y artículos críticos.
   */
  @Get('kpis')
  async obtenerKpis(@Query('empresa_id') empresaId?: string) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.inventarioRepo.obtenerKpis(idEmpresa);
  }

  /**
   * POST /inventario/:productoId/ajuste
   * Ajusta la existencia física de un producto en la base de datos.
   */
  @Post(':productoId/ajuste')
  async ajustarStock(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() dto: AjustarStockDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.inventarioRepo.ajustarStock(productoId, Number(dto.existencia), idEmpresa);
  }
}
