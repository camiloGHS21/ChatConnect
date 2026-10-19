import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * ============================================================================
 * REPOSITORIO DE OPERACIÓN (Dashboard) — Pedidos, Productos y Clientes
 * ============================================================================
 * Consultas agregadas en PostgreSQL (RULE 1: Controller ──► Repository ──► DB).
 * Cubre las métricas operativas del panel de inicio: clientes WhatsApp,
 * pedidos, ventas, inventario y demanda por zona.
 */
@Injectable()
export class DashboardOperacionRepository {
  constructor(private readonly dataSource: DataSource) {}

  /** Clientes WhatsApp activos (terceros de tipo cliente/ambos). */
  async contarClientes(empresaId: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total
         FROM public.tercero
        WHERE empresa_id = $1
          AND tipo_tercero IN ('cliente', 'ambos')
          AND estado = 'activo';`,
      [empresaId],
    );
    return Number(rows[0]?.total || 0);
  }

  /** KPIs de pedidos: total, ventas acumuladas y actividad del día. */
  async kpisPedidos(empresaId: number) {
    const rows = await this.dataSource.query(
      `SELECT
         COUNT(*)::int AS total_pedidos,
         COALESCE(SUM(total), 0)::numeric AS ventas_total,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int AS pedidos_hoy,
         COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('day', now())), 0)::numeric AS monto_hoy
       FROM public.pedido
       WHERE empresa_id = $1;`,
      [empresaId],
    );
    const r = rows[0] || {};
    return {
      total_pedidos: Number(r.total_pedidos || 0),
      ventas_total: Number(r.ventas_total || 0),
      pedidos_hoy: Number(r.pedidos_hoy || 0),
      monto_hoy: Number(r.monto_hoy || 0),
    };
  }

  /** KPIs de inventario: productos activos y alertas de stock crítico (<= 5). */
  async kpisInventario(empresaId: number) {
    const rows = await this.dataSource.query(
      `WITH inv AS (
         SELECT p.id_producto,
                GREATEST(0, COALESCE(SUM(i.existencia), 0) - COALESCE(SUM(i.reservado), 0)) AS disponible
           FROM public.producto p
           LEFT JOIN public.inventario i
             ON i.producto_id = p.id_producto AND i.empresa_id = $1
          WHERE p.empresa_id = $1 AND p.estado_producto = 'activo'
          GROUP BY p.id_producto
       )
       SELECT COUNT(*)::int AS productos_activos,
              COUNT(*) FILTER (WHERE disponible <= 5)::int AS criticos,
              COALESCE(SUM(disponible), 0)::int AS disponible_total
         FROM inv;`,
      [empresaId],
    );
    const r = rows[0] || {};
    return {
      productos_activos: Number(r.productos_activos || 0),
      stock_criticos: Number(r.criticos || 0),
      stock_disponible_total: Number(r.disponible_total || 0),
    };
  }

  /** Últimos pedidos formalizados con datos del cliente para la tabla resumen. */
  async ultimosPedidos(empresaId: number, limite = 4) {
    const rows = await this.dataSource.query(
      `SELECT
         p.id_pedido AS id,
         p.numero_pedido,
         COALESCE(
           NULLIF(TRIM(t.razon_social), ''),
           NULLIF(TRIM(CONCAT(COALESCE(t.nombre, ''), ' ', COALESCE(t.apellido, ''))), ''),
           'Cliente WhatsApp'
         ) AS cliente_nombre,
         COALESCE(t.whatsapp, '') AS whatsapp,
         COALESCE(p.tipo_entrega, 'domicilio') AS tipo_entrega,
         COALESCE(p.direccion_entrega, 'Retiro en Tienda') AS direccion_entrega,
         p.total::numeric AS total,
         COALESCE(p.estado, 'pendiente') AS estado,
         to_char(p.created_at, 'DD/MM/YYYY HH12:MI AM') AS fecha
       FROM public.pedido p
       LEFT JOIN public.tercero t ON t.id_tercero = p.tercero_id
       WHERE p.empresa_id = $1
       ORDER BY p.id_pedido DESC
       LIMIT $2;`,
      [empresaId, limite],
    );
    return rows.map((r: any) => ({
      id: Number(r.id),
      numero_pedido: r.numero_pedido,
      cliente_nombre: r.cliente_nombre,
      whatsapp: r.whatsapp,
      tipo_entrega: r.tipo_entrega,
      direccion_entrega: r.direccion_entrega,
      total: Number(r.total || 0),
      estado: r.estado,
      fecha: r.fecha,
    }));
  }

  /** Demanda de despachos agrupada por ciudad del cliente comprador. */
  async zonasEntrega(empresaId: number, limite = 6) {
    const rows = await this.dataSource.query(
      `SELECT COALESCE(NULLIF(TRIM(t.ciudad), ''), 'Sin ciudad registrada') AS name,
              COUNT(*)::int AS amount
         FROM public.pedido p
         LEFT JOIN public.tercero t ON t.id_tercero = p.tercero_id
        WHERE p.empresa_id = $1
        GROUP BY 1
        ORDER BY amount DESC
        LIMIT $2;`,
      [empresaId, limite],
    );
    return rows.map((r: any) => ({ name: r.name, amount: Number(r.amount || 0) }));
  }

  /** Productos más cotizados según las líneas registradas en pedido_detalle. */
  async topProductos(empresaId: number, limite = 5) {
    const rows = await this.dataSource.query(
      `SELECT
         p.id_producto AS id,
         p.nombre,
         COALESCE(p.codigo_interno, CONCAT('FER-', LPAD(p.id_producto::text, 4, '0'))) AS sku,
         COALESCE(c.nombre, 'Sin categoría') AS categoria,
         COUNT(DISTINCT pd.pedido_id)::int AS pedidos,
         COALESCE(SUM(pd.cantidad), 0)::int AS unidades,
         p.precio_base::numeric AS precio,
         COALESCE(inv.disponible, 0)::int AS disponible
       FROM public.pedido_detalle pd
       JOIN public.pedido pe ON pe.id_pedido = pd.pedido_id AND pe.empresa_id = $1
       JOIN public.producto p ON p.id_producto = pd.producto_id
       LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
       LEFT JOIN (
         SELECT producto_id,
                GREATEST(0, COALESCE(SUM(existencia), 0) - COALESCE(SUM(reservado), 0))::int AS disponible
           FROM public.inventario
          WHERE empresa_id = $1
          GROUP BY producto_id
       ) inv ON inv.producto_id = p.id_producto
       GROUP BY p.id_producto, p.nombre, p.codigo_interno, c.nombre, p.precio_base, inv.disponible
       ORDER BY unidades DESC, pedidos DESC
       LIMIT $2;`,
      [empresaId, limite],
    );
    return rows.map((r: any) => ({
      id: Number(r.id),
      nombre: r.nombre,
      sku: r.sku,
      categoria: r.categoria,
      pedidos: Number(r.pedidos || 0),
      unidades: Number(r.unidades || 0),
      precio: Number(r.precio || 0),
      disponible: Number(r.disponible || 0),
    }));
  }

  /** Conteo de pedidos por mes (últimos 12 meses) para la serie temporal. */
  async seriePedidosMensual(empresaId: number) {
    const rows = await this.dataSource.query(
      `SELECT to_char(created_at, 'YYYY-MM') AS ym, COUNT(*)::int AS total
         FROM public.pedido
        WHERE empresa_id = $1
          AND created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY 1;`,
      [empresaId],
    );
    return rows.map((r: any) => ({ ym: r.ym, total: Number(r.total || 0) }));
  }
}
