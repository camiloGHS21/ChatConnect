import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaRepo: EmpresaRepository) {}

  @Get('perfil')
  obtenerPerfil(@Query('empresa_id') empresaId?: string) {
    return this.empresaRepo.obtenerPerfil(empresaId ? parseInt(empresaId, 10) : 1);
  }

  @Patch('perfil')
  actualizarPerfil(
    @Body() dto: UpdateEmpresaDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    return this.empresaRepo.actualizarPerfil(empresaId ? parseInt(empresaId, 10) : 1, dto);
  }
}
