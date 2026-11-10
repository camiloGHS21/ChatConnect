import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RetencionRepository } from './retencion.repository.js';
import {
  ImpuestoModel,
  DepartamentoModel,
  CiudadModel,
} from '../models/producto.model.js';

@Injectable()
export class CatalogoConfigRepository {
  private readonly logger = new Logger(CatalogoConfigRepository.name);

  constructor(
    @InjectRepository(ImpuestoModel)
    private readonly impuestoRepo: Repository<ImpuestoModel>,

    @InjectRepository(DepartamentoModel)
    private readonly departamentoRepo: Repository<DepartamentoModel>,

    @InjectRepository(CiudadModel)
    private readonly ciudadRepo: Repository<CiudadModel>,

    private readonly dataSource: DataSource,
    private readonly retencionRepo: RetencionRepository,
  ) { }

  /**
   * Garantiza que cada empresa tenga los impuestos oficiales de la DIAN por defecto
   * y la unidad de medida con código 94 de la DIAN.
   */
  async asegurarConfiguracionDianPorDefecto(empresaId = 1): Promise<void> {
    try {
      await this.dataSource.query(
        `UPDATE public.medida
         SET codigo = '94', nombre = 'Unidad', estado = 'activo'
         WHERE empresa_id = $1 AND (codigo = '94' OR codigo = 'UND' OR id_medida = 1);`,
        [empresaId],
      );
      const existeMedida94 = await this.dataSource.query(
        `SELECT id_medida FROM public.medida WHERE empresa_id = $1 AND codigo = '94';`,
        [empresaId],
      );
      if (!existeMedida94 || existeMedida94.length === 0) {
        await this.dataSource.query(
          `INSERT INTO public.medida (id_medida, empresa_id, codigo, nombre, estado)
           VALUES (1, $1, '94', 'Unidad', 'activo')
           ON CONFLICT DO NOTHING;`,
          [empresaId],
        );
      }
      await this.dataSource.query(
        `UPDATE public.producto SET medida_id = 1 WHERE empresa_id = $1;`,
        [empresaId],
      );
      await this.dataSource.query(
        `DELETE FROM public.medida WHERE empresa_id = $1 AND codigo != '94';`,
        [empresaId],
      );

      const dianTaxes = [
        { codigo: 'IVA19', nombre: 'IVA General 19%', porcentaje: 19.00, tipo: 'PORCENTAJE' },
        { codigo: 'IVA5', nombre: 'IVA Diferencial 5%', porcentaje: 5.00, tipo: 'PORCENTAJE' },
        { codigo: 'IVA0', nombre: 'Exento de IVA 0%', porcentaje: 0.00, tipo: 'PORCENTAJE' },
        { codigo: 'EXCLUIDO', nombre: 'Excluido de IVA', porcentaje: 0.00, tipo: 'PORCENTAJE' },
        { codigo: 'INC8', nombre: 'Impoconsumo 8%', porcentaje: 8.00, tipo: 'PORCENTAJE' },
        { codigo: 'INC16', nombre: 'Impoconsumo 16%', porcentaje: 16.00, tipo: 'PORCENTAJE' },
      ];

      for (const t of dianTaxes) {
        const existing = await this.impuestoRepo.findOne({
          where: { empresaId, codigo: t.codigo },
        });
        if (!existing) {
          await this.impuestoRepo.save({
            empresaId,
            codigo: t.codigo,
            nombre: t.nombre,
            porcentaje: t.porcentaje,
            valor: undefined,
            tipo: t.tipo,
            estado: 'activo',
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Error asegurando configuración DIAN para empresa ${empresaId}: ${err.message}`);
    }
  }

  /**
   * Obtiene la estructura consolidada para la vista de configuración de catálogos.
   */
  async getCatalogosConfiguracion(empresaId = 1) {
    try {
      await this.retencionRepo.asegurarPorDefecto(empresaId);
      await this.asegurarConfiguracionDianPorDefecto(empresaId);
      const [categoriasRaw, marcasRaw, listasPreciosRaw, impuestos, departamentos, ciudades, retenciones] = await Promise.all([
        this.dataSource.query(
          `SELECT c.id_categoria AS id, c.nombre, c.estado,
                  COUNT(p.id_producto)::int AS total_productos
           FROM public.categoria c
           LEFT JOIN public.producto p ON p.categoria_id = c.id_categoria AND p.empresa_id = c.empresa_id
           WHERE c.empresa_id = $1
           GROUP BY c.id_categoria, c.nombre, c.estado
           ORDER BY c.nombre ASC;`,
          [empresaId],
        ),
        this.dataSource.query(
          `SELECT m.id_marca AS id, m.nombre, m.estado,
                  COUNT(p.id_producto)::int AS total_productos
           FROM public.marca m
           LEFT JOIN public.producto p ON p.marca_id = m.id_marca AND p.empresa_id = m.empresa_id
           WHERE m.empresa_id = $1
           GROUP BY m.id_marca, m.nombre, m.estado
           ORDER BY m.nombre ASC;`,
          [empresaId],
        ),
        this.dataSource.query(
          `SELECT lp.id_lista_precio AS id, lp.nombre, lp.estado,
                  COUNT(plp.id_producto_lista_precio)::int AS total_productos
           FROM public.lista_precio lp
           LEFT JOIN public.producto_lista_precio plp ON plp.lista_precio_id = lp.id_lista_precio
           WHERE lp.empresa_id = $1
           GROUP BY lp.id_lista_precio, lp.nombre, lp.estado
           ORDER BY lp.nombre ASC;`,
          [empresaId],
        ),
        this.impuestoRepo.find({ where: { empresaId }, order: { nombre: 'ASC' } }),
        this.departamentoRepo.find({ where: { estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.ciudadRepo.find({ where: { estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.retencionRepo.listar(empresaId),
      ]);

      return {
        retenciones,
        categorias: categoriasRaw.map((c: any) => ({
          id: Number(c.id),
          nombre: c.nombre,
          estado: c.estado,
          total_productos: Number(c.total_productos) || 0,
        })),
        marcas: marcasRaw.map((m: any) => ({
          id: Number(m.id),
          nombre: m.nombre,
          estado: m.estado,
          total_productos: Number(m.total_productos) || 0,
        })),
        listasPrecios: listasPreciosRaw.map((l: any) => ({
          id: Number(l.id),
          nombre: l.nombre,
          estado: l.estado,
          total_productos: Number(l.total_productos) || 0,
        })),
        impuestos: impuestos.map(i => ({
          id: Number(i.id),
          codigo: i.codigo,
          nombre: i.nombre,
          porcentaje: Number(i.porcentaje) || 0,
          valor: i.valor === null || i.valor === undefined ? null : Number(i.valor),
          tipo: i.tipo,
          estado: i.estado,
        })),
        departamentos: departamentos.map(d => ({ id: Number(d.id), codigo: d.codigo, nombre: d.nombre })),
        ciudades: ciudades.map(c => ({
          id: Number(c.id),
          id_departamento: Number(c.idDepartamento),
          codigo: c.codigo,
          nombre: c.nombre,
        })),
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener catálogos de configuración: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al cargar los catálogos de configuración');
    }
  }
}
