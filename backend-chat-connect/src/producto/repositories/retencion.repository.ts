import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFile } from 'node:fs/promises';
import { DataSource, Repository } from 'typeorm';
import { RetencionModel } from '../models/retencion.model.js';
import type {
  RetencionBase,
  RetencionEstado,
  RetencionGrupo,
} from '../models/retencion.model.js';

export interface RetencionCatalogo {
  id: number;
  empresa_id: number;
  nombre: string;
  estado: RetencionEstado;
  codigo: string | null;
  grupo: RetencionGrupo;
  tipo: string;
  porcentaje: number | null;
  base_calculo: RetencionBase;
  base_minima_uvt: number | null;
  condicion: string | null;
  norma: string | null;
  fuente_url: string | null;
  seleccionable: boolean;
  verificado_en: string | null;
  total_productos: number;
}

type RetencionFila = Omit<RetencionCatalogo,
  'id' | 'empresa_id' | 'porcentaje' | 'base_minima_uvt' | 'total_productos'> & {
  id: string | number;
  empresa_id: string | number;
  porcentaje: string | number | null;
  base_minima_uvt: string | number | null;
  total_productos: string | number;
};

@Injectable()
export class RetencionRepository {
  // Comparte el trabajo en curso entre instancias sin mezclar conexiones a otras BD.
  private static readonly esquemas = new WeakMap<DataSource, Promise<void>>();

  constructor(
    @InjectRepository(RetencionModel)
    private readonly retencionRepo: Repository<RetencionModel>,
    private readonly dataSource: DataSource,
  ) {}

  async asegurarPorDefecto(empresaId: number): Promise<void> {
    this.validarId(empresaId, 'empresaId');
    await this.asegurarEsquema();
    const sql = await readFile(new URL('../seeds/retenciones-dian.sql', import.meta.url), 'utf8');
    // No cachear la semilla: ambos GET deben comprobarla en cada carga.
    await this.dataSource.transaction(async manager => {
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))',
        [`retenciones:dian:empresa:${empresaId}`],
      );
      await manager.query(sql, [empresaId]);
    });
  }

  async listar(empresaId: number, soloActivas = false): Promise<RetencionCatalogo[]> {
    this.validarId(empresaId, 'empresaId');
    await this.asegurarEsquema();
    const filas: RetencionFila[] = await this.retencionRepo.query(
      `SELECT r.id_retencion AS id, r.empresa_id, r.nombre, r.estado,
              r.codigo, r.grupo, r.tipo, r.porcentaje, r.base_calculo,
              r.base_minima_uvt, r.condicion, r.norma, r.fuente_url,
              r.seleccionable, r.verificado_en::text AS verificado_en,
              COUNT(DISTINCT p.id_producto)::int AS total_productos
       FROM public.retencion r
       LEFT JOIN public.producto_retencion pr ON pr.retencion_id = r.id_retencion
       LEFT JOIN public.producto p
         ON p.id_producto = pr.producto_id AND p.empresa_id = r.empresa_id
       WHERE r.empresa_id = $1
         ${soloActivas ? "AND r.estado = 'activo' AND r.seleccionable = TRUE AND r.porcentaje IS NOT NULL" : ''}
       GROUP BY r.id_retencion
       ORDER BY r.nombre ASC, r.id_retencion ASC`,
      [empresaId],
    );
    return filas.map(fila => ({
      ...fila,
      id: Number(fila.id),
      empresa_id: Number(fila.empresa_id),
      porcentaje: fila.porcentaje === null ? null : Number(fila.porcentaje),
      base_minima_uvt: fila.base_minima_uvt === null ? null : Number(fila.base_minima_uvt),
      total_productos: Number(fila.total_productos),
    }));
  }

  async actualizarEstado(id: number, estado: string, empresaId: number) {
    this.validarId(id, 'id');
    this.validarId(empresaId, 'empresaId');
    if (estado !== 'activo' && estado !== 'inactivo') {
      throw new BadRequestException('El estado debe ser activo o inactivo');
    }
    await this.asegurarEsquema();
    // SELECT final conserva el contrato de filas; TypeORM devuelve [filas, count] en UPDATE directo.
    const filas: { id: string | number; estado: RetencionEstado }[] =
      await this.retencionRepo.query(
        `WITH modificada AS (
           UPDATE public.retencion SET estado = $2
           WHERE id_retencion = $1 AND empresa_id = $3
           RETURNING id_retencion, estado
         ) SELECT id_retencion AS id, estado FROM modificada`,
        [id, estado, empresaId],
      );
    if (!filas.length) throw new NotFoundException('Retención no encontrada para la empresa');
    return { id: Number(filas[0].id), estado: filas[0].estado };
  }

  private async asegurarEsquema(): Promise<void> {
    const existente = RetencionRepository.esquemas.get(this.dataSource);
    if (existente) return existente;

    const pendiente = (async () => {
      const sql = await readFile(new URL('../seeds/retenciones-schema.sql', import.meta.url), 'utf8');
      await this.dataSource.transaction(async manager => {
        await manager.query(
          'SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))',
          ['retenciones:esquema:public.retencion'],
        );
        await manager.query(sql);
      });
    })();
    RetencionRepository.esquemas.set(this.dataSource, pendiente);
    try {
      await pendiente;
    } catch (error) {
      if (RetencionRepository.esquemas.get(this.dataSource) === pendiente) {
        RetencionRepository.esquemas.delete(this.dataSource);
      }
      throw error;
    }
  }

  private validarId(valor: number, campo: string): void {
    if (!Number.isSafeInteger(valor) || valor <= 0) {
      throw new BadRequestException(`${campo} debe ser un entero positivo seguro`);
    }
  }
}
