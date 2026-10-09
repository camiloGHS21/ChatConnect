import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InventarioRepository {
  private readonly logger = new Logger(InventarioRepository.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Lista todos los productos con su stock físico, reservado por WhatsApp y disponible.
   */
  async listar(empresaId = 1, filtros?: { search?: string; filterLevel?: string }) {
    let sql = `
      SELECT
        p.id_producto AS id,
        p.id_producto,
        p.nombre,
        COALESCE(p.codigo_interno, CONCAT('FER-', LPAD(p.id_producto::text, 4, '0'))) AS sku,
        COALESCE(c.nombre, 'Sin categoría') AS categoria,
        COALESCE(inv.existencia, 0)::int AS existencia,
        COALESCE(inv.reservado, 0)::int AS reservado,
        GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0))::int AS disponible,
        p.stock_minimo::int AS stock_minimo,
        p.stock_maximo::int AS stock_maximo,
        p.maneja_inventario,
        p.precio_base::numeric AS precio,
        p.costo_base::numeric AS costo,
        img.url AS imagen_url,
        COALESCE(inv.updated_at, p.updated_at) AS updated_at
      FROM public.producto p
      LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
      LEFT JOIN (
        SELECT
          producto_id,
          SUM(existencia) AS existencia,
          SUM(reservado) AS reservado,
          MAX(updated_at) AS updated_at
        FROM public.inventario
        WHERE empresa_id = $1
        GROUP BY producto_id
      ) inv ON inv.producto_id = p.id_producto
      LEFT JOIN (
        SELECT DISTINCT ON (producto_id) producto_id, url
        FROM public.producto_imagen
        WHERE estado = 'activo'
        ORDER BY producto_id, principal DESC, orden ASC, id_producto_imagen ASC
      ) img ON img.producto_id = p.id_producto
      WHERE p.empresa_id = $1 AND p.estado_producto = 'activo'
    `;

    const params: any[] = [empresaId];

    if (filtros?.search && filtros.search.trim()) {
      params.push(`%${filtros.search.trim().toLowerCase()}%`);
      sql += ` AND (
        LOWER(p.nombre) LIKE $${params.length}
        OR LOWER(COALESCE(p.codigo_interno, '')) LIKE $${params.length}
        OR LOWER(COALESCE(c.nombre, '')) LIKE $${params.length}
      )`;
    }

    if (filtros?.filterLevel === 'critical') {
      sql += ` AND GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) <= 5`;
    } else if (filtros?.filterLevel === 'normal') {
      sql += ` AND GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) > 5`;
    }

    sql += ` ORDER BY p.id_producto ASC`;

    const rows = await this.dataSource.query(sql, params);

    return rows.map((r: any) => ({
      id: Number(r.id),
      producto_id: Number(r.id_producto),
      nombre: r.nombre,
      sku: r.sku,
      categoria: r.categoria,
      existencia: Number(r.existencia || 0),
      reservado: Number(r.reservado || 0),
      disponible: Number(r.disponible || 0),
      stock_minimo: Number(r.stock_minimo || 0),
      stock_maximo: Number(r.stock_maximo || 0),
      maneja_inventario: Boolean(r.maneja_inventario),
      precio: Number(r.precio || 0),
      costo: Number(r.costo || 0),
      imagen_url: r.imagen_url || null,
      updated_at: r.updated_at,
    }));
  }

  /**
   * Obtiene las métricas KPI agregadas de inventario en tiempo real.
   */
  async obtenerKpis(empresaId = 1) {
    const sql = `
      WITH inventario_prod AS (
        SELECT
          p.id_producto,
          COALESCE(inv.existencia, 0)::int AS existencia,
          COALESCE(inv.reservado, 0)::int AS reservado,
          GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0))::int AS disponible
        FROM public.producto p
        LEFT JOIN (
          SELECT
            producto_id,
            SUM(existencia) AS existencia,
            SUM(reservado) AS reservado
          FROM public.inventario
          WHERE empresa_id = $1
          GROUP BY producto_id
        ) inv ON inv.producto_id = p.id_producto
        WHERE p.empresa_id = $1 AND p.estado_producto = 'activo'
      )
      SELECT
        COALESCE(SUM(existencia), 0)::int AS total_existencia,
        COALESCE(SUM(reservado), 0)::int AS total_reservado,
        COALESCE(SUM(disponible), 0)::int AS total_disponible,
        COUNT(CASE WHEN disponible <= 5 THEN 1 END)::int AS total_criticos
      FROM inventario_prod;
    `;

    const rows = await this.dataSource.query(sql, [empresaId]);
    const r = rows[0] || {};

    return {
      totalExistencia: Number(r.total_existencia || 0),
      totalReservado: Number(r.total_reservado || 0),
      totalDisponible: Number(r.total_disponible || 0),
      totalCriticos: Number(r.total_criticos || 0),
    };
  }

  /**
   * Ajusta la existencia física de un producto en la base de datos.
   */
  async ajustarStock(productoId: number, nuevaExistencia: number, empresaId = 1) {
    if (nuevaExistencia < 0) {
      throw new BadRequestException('La existencia física no puede ser menor a cero.');
    }

    const prod = await this.dataSource.query(
      `SELECT id_producto, nombre FROM public.producto WHERE id_producto = $1 AND empresa_id = $2;`,
      [productoId, empresaId],
    );
    if (!prod || prod.length === 0) {
      throw new NotFoundException(`El producto con ID ${productoId} no existe.`);
    }

    const existing = await this.dataSource.query(
      `SELECT id_inventario, existencia, reservado FROM public.inventario WHERE empresa_id = $1 AND producto_id = $2 ORDER BY id_inventario ASC;`,
      [empresaId, productoId],
    );

    if (existing.length === 0) {
      await this.dataSource.query(
        `INSERT INTO public.inventario (empresa_id, producto_id, existencia, reservado, updated_at) VALUES ($1, $2, $3, 0, now());`,
        [empresaId, productoId, nuevaExistencia],
      );
    } else {
      await this.dataSource.query(
        `UPDATE public.inventario SET existencia = $1, updated_at = now() WHERE id_inventario = $2;`,
        [nuevaExistencia, existing[0].id_inventario],
      );
      for (let i = 1; i < existing.length; i++) {
        await this.dataSource.query(
          `UPDATE public.inventario SET existencia = 0, updated_at = now() WHERE id_inventario = $1;`,
          [existing[i].id_inventario],
        );
      }
    }

    // Consulta el estado actualizado del producto
    const updated = await this.listar(empresaId, { search: prod[0].nombre });
    return updated.find((p: any) => p.producto_id === productoId) || {
      producto_id: productoId,
      existencia: nuevaExistencia,
    };
  }
}
