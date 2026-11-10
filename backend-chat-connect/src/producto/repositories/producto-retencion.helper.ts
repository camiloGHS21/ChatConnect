import { BadRequestException } from '@nestjs/common';
import type { QueryRunner } from 'typeorm';
import type { RetencionItemDto } from '../dto/create-producto.dto.js';

interface RetencionCatalogoFila {
  id_retencion: string | number;
  codigo?: string | null;
  estado?: string;
  seleccionable?: boolean;
  porcentaje?: string | number | null;
}

interface RetencionProductoValidada {
  retencion_id: number;
  tipo: 'PORCENTAJE' | 'VALOR_FIJO';
  porcentaje: number | null;
  valor_fijo: number | null;
}

function validarValor(valor: unknown, esPorcentaje: boolean): number {
  const numero = (typeof valor === 'number' || (typeof valor === 'string' && valor.trim() !== ''))
    ? Number(valor) : NaN;
  if (!Number.isFinite(numero) || numero < 0 || (esPorcentaje && numero > 100)) {
    throw new BadRequestException(esPorcentaje
      ? 'El porcentaje de retención debe ser finito y estar entre 0 y 100'
      : 'El valor fijo de retención debe ser finito y mayor o igual a cero');
  }
  return numero;
}

export async function resolverRetencionProducto(
  queryRunner: Pick<QueryRunner, 'query'>,
  dto: RetencionItemDto,
  empresaId: number,
  esAsignacionExistente = false,
): Promise<RetencionProductoValidada> {
  const retencionId = Number(dto?.retencion_id);
  if (!Number.isSafeInteger(retencionId) || retencionId <= 0) {
    throw new BadRequestException('El ID de retención debe ser un entero positivo');
  }
  // SELECT * admite también el esquema legacy, sin columnas de metadata.
  const filas: RetencionCatalogoFila[] = await queryRunner.query(
    `SELECT * FROM public.retencion WHERE id_retencion = $1 AND empresa_id = $2;`,
    [retencionId, empresaId],
  );
  const catalogo = filas[0];
  if (!catalogo) throw new BadRequestException('La retención no existe en la empresa');
  if (catalogo.estado === 'inactivo' && !esAsignacionExistente) {
    throw new BadRequestException('No se puede asignar una retención inactiva');
  }

  if (catalogo.codigo != null) {
    if (catalogo.seleccionable !== true || catalogo.porcentaje == null) {
      throw new BadRequestException('La retención no es seleccionable para productos');
    }
    return {
      retencion_id: retencionId,
      tipo: 'PORCENTAJE',
      porcentaje: validarValor(catalogo.porcentaje, true),
      valor_fijo: null,
    };
  }

  const tipo = dto.tipo ?? 'PORCENTAJE';
  if (tipo !== 'PORCENTAJE' && tipo !== 'VALOR_FIJO') {
    throw new BadRequestException('El tipo de retención debe ser PORCENTAJE o VALOR_FIJO');
  }
  return {
    retencion_id: retencionId,
    tipo,
    porcentaje: tipo === 'PORCENTAJE' ? validarValor(dto.porcentaje, true) : null,
    valor_fijo: tipo === 'VALOR_FIJO' ? validarValor(dto.valor_fijo, false) : null,
  };
}
