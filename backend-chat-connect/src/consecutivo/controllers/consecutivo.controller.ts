import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UpdateConsecutivoDto } from '../dto/update-consecutivo.dto.js';
import { ConsecutivoRepository } from '../repositories/consecutivo.repository.js';

@Controller('consecutivos')
export class ConsecutivoController {
  constructor(private readonly consecutivoRepo: ConsecutivoRepository) {}

  @Get()
  listar(@Query('empresa_id') empresaId?: string) {
    return this.consecutivoRepo.listar(empresaId ? parseInt(empresaId, 10) : 1);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateConsecutivoDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    return this.consecutivoRepo.actualizar(
      parseInt(id, 10),
      empresaId ? parseInt(empresaId, 10) : 1,
      dto,
    );
  }
}
