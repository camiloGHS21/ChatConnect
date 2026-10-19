import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto.js';
import { EmpresaModel } from '../models/empresa.model.js';

@Injectable()
export class EmpresaRepository {
  constructor(
    @InjectRepository(EmpresaModel)
    private readonly empresaRepo: Repository<EmpresaModel>,
  ) {}

  async obtenerPerfil(empresaId: number) {
    const empresa = await this.empresaRepo.findOne({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  async actualizarPerfil(empresaId: number, dto: UpdateEmpresaDto) {
    const empresa = await this.obtenerPerfil(empresaId);
    const nombreComercial = dto.nombre_comercial?.trim();
    if (!nombreComercial) {
      throw new BadRequestException('El nombre comercial de la empresa es obligatorio');
    }

    if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      throw new BadRequestException('El correo electrónico de la empresa no es válido');
    }

    const textFields: Array<keyof UpdateEmpresaDto> = [
      'razon_social', 'nombre_comercial', 'nit', 'telefono', 'whatsapp',
      'email', 'direccion', 'pais', 'departamento', 'ciudad', 'sector',
    ];
    for (const field of textFields) {
      const value = dto[field];
      if (value !== undefined) {
        (empresa as any)[field] = typeof value === 'string' ? value.trim() || null : value;
      }
    }
    empresa.nombre_comercial = nombreComercial;
    if (dto.categoria_producto_obligatoria !== undefined) {
      empresa.categoria_producto_obligatoria = Boolean(dto.categoria_producto_obligatoria);
    }
    empresa.updated_at = new Date();
    return this.empresaRepo.save(empresa);
  }
}
