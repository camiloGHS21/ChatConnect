import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { EmpresaLimpiezaRepository } from '../repositories/empresa-limpieza.repository.js';
import { PurgarDatosDto } from '../dto/purgar-datos.dto.js';

/**
 * ============================================================================
 * CONTROLADOR: Gestión y Purga de Datos de Empresa
 * ============================================================================
 * Flujo directo: Controller ──► EmpresaLimpiezaRepository ──► PostgreSQL (RULE 1)
 */
@Controller('empresa-datos')
export class EmpresaLimpiezaController {
  constructor(private readonly limpiezaRepo: EmpresaLimpiezaRepository) {}

  @Get('resumen')
  async getResumen(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.limpiezaRepo.getResumenDatos(id);
  }

  @Post('purgar')
  @HttpCode(HttpStatus.OK)
  async purgarDatos(@Body() dto: PurgarDatosDto, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.limpiezaRepo.purgarDatos(dto, id);
  }
}
