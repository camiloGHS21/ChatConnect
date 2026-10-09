import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto.js';

@Controller(['clientes', 'cliente'])
export class ClienteController {
  constructor(private readonly clienteRepo: ClienteRepository) {}

  /**
   * GET /clientes
   * Lista todos los clientes con métricas consolidadas.
   */
  @Get()
  async listar(
    @Query('empresa_id') empresaId?: string,
    @Query('search') search?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.clienteRepo.listar(idEmpresa, { search });
  }

  /**
   * GET /clientes/kpis
   * Retorna métricas en tiempo real para las tarjetas de KPIs del módulo de clientes.
   */
  @Get('kpis')
  async obtenerKpis(@Query('empresa_id') empresaId?: string) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.clienteRepo.obtenerKpis(idEmpresa);
  }

  /**
   * GET /clientes/:id
   * Obtiene la ficha detallada de un cliente con su historial de pedidos.
   */
  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @Query('empresa_id') empresaId?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.clienteRepo.obtenerPorId(id, idEmpresa);
  }

  /**
   * POST /clientes
   * Registra un nuevo cliente en el CRM (public.tercero).
   */
  @Post()
  async crear(
    @Body() dto: CreateClienteDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.clienteRepo.crear(dto, idEmpresa);
  }

  /**
   * PATCH /clientes/:id
   * Actualiza los datos de un cliente existente.
   */
  @Patch(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const idEmpresa = empresaId ? parseInt(empresaId, 10) : 1;
    return this.clienteRepo.actualizar(id, dto, idEmpresa);
  }
}
