import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductoQueryRepository {
  private readonly logger = new Logger(ProductoQueryRepository.name);

  constructor(private readonly dataSource: DataSource) { }

  /**
   * Obtiene la vista previa del siguiente código autosecuencial oficial.
   */
  async getSiguienteCodigo(empresaId = 1): Promise<{ codigo: string }> {
    try {
      const rows = await this.dataSource.query(
        `SELECT COALESCE(prefijo, '') || LPAD((consecutivo_actual + 1)::TEXT, longitud, '0') AS codigo
         FROM public.secuencia
         WHERE empresa_id = $1 AND UPPER(modulo) IN ('PRODUCTO','PRODUCTOS') AND estado = 'activo'
         LIMIT 1`,
        [empresaId],
      );
      if (rows && rows.length > 0) {
        return { codigo: rows[0].codigo };
      }
      return { codigo: 'PRD-0001' };
    } catch (error: any) {
      this.logger.error(`Error al consultar secuencia: ${error.message}`);
      return { codigo: 'PRD-0001' };
    }
  }

  /**
   * Obtiene la lista completa de productos para la vista de catálogo.
   */
  async getProductos(empresaId = 1) {
    try {
      const sql = `
        SELECT
          p.id_producto AS id,
          p.codigo_interno AS sku,
          p.nombre,
          COALESCE(c.nombre, 'Sin Categoría') AS categoria,
          p.categoria_id,
          COALESCE(sc.nombre, '') AS subcategoria,
          p.subcategoria_id,
          COALESCE(m.nombre, '') AS marca,
          (
            SELECT pr.referencia
            FROM public.producto_referencia pr
            WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
            ORDER BY pr.id_producto_referencia ASC
            LIMIT 1
          ) AS referencia,
          p.precio_base AS precio,
          p.precio_impuesto,
          p.costo_base,
          COALESCE(inv.existencia, 0) AS existencia,
          COALESCE(inv.reservado, 0) AS reservado,
          GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
          p.estado_producto = 'activo' AS activo,
          p.fb_product_id,
          p.meta_sync_status,
          p.meta_sync_error,
          p.meta_synced_at,
          img.url AS imagen_principal,
          p.created_at
        FROM public.producto p
        LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
        LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
        LEFT JOIN public.marca m ON m.id_marca = p.marca_id
        LEFT JOIN (
          SELECT DISTINCT ON (producto_id) producto_id, url
          FROM public.producto_imagen
          WHERE estado = 'activo'
          ORDER BY producto_id, principal DESC, orden ASC, id_producto_imagen ASC
        ) img ON img.producto_id = p.id_producto
        LEFT JOIN (
          SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
          FROM public.inventario
          WHERE empresa_id = $1
          GROUP BY producto_id
        ) inv ON inv.producto_id = p.id_producto
        WHERE p.empresa_id = $1
        ORDER BY p.id_producto DESC;
      `;
      return await this.dataSource.query(sql, [empresaId]);
    } catch (error: any) {
      this.logger.error(`Error al listar productos: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al consultar catálogo de productos');
    }
  }

  /**
   * Obtiene un producto completo por su ID para edición o consulta detallada.
   */
  async getProductoPorId(productoId: number, empresaId = 1) {
    const prodRows = await this.dataSource.query(
      `SELECT
         p.*,
         COALESCE(c.nombre, '') AS categoria_nombre,
         COALESCE(sc.nombre, '') AS subcategoria_nombre,
         COALESCE(m.nombre, '') AS marca_nombre,
         (
           SELECT pr.referencia
           FROM public.producto_referencia pr
           WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
           ORDER BY pr.id_producto_referencia ASC
           LIMIT 1
         ) AS referencia_principal,
         GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
         COALESCE(inv.existencia, 0) AS existencia_actual
       FROM public.producto p
       LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
       LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
       LEFT JOIN public.marca m ON m.id_marca = p.marca_id
       LEFT JOIN (
         SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
         FROM public.inventario
         WHERE empresa_id = $1
         GROUP BY producto_id
       ) inv ON inv.producto_id = p.id_producto
       WHERE p.id_producto = $2 AND p.empresa_id = $1
       LIMIT 1;`,
      [empresaId, productoId],
    );

    const prod = prodRows[0];
    if (!prod) {
      throw new NotFoundException(`El producto con ID ${productoId} no fue encontrado`);
    }

    const [
      impuestosCompra,
      impuestosVenta,
      listasPrecios,
      retenciones,
      referencias,
      codigosBarras,
      proveedores,
      seoIa,
      imagenes,
      atributosAsignados,
      variantes,
    ] = await Promise.all([
      this.dataSource.query(
        `SELECT pic.impuesto_id, i.codigo, i.nombre, i.porcentaje, i.valor AS valor_fijo, i.tipo AS tipo_calculo, pic.valor_impuesto
         FROM public.producto_impuesto_compra pic
         JOIN public.impuesto i ON i.id_impuesto = pic.impuesto_id
         WHERE pic.producto_id = $1 AND pic.estado = 'activo'
         ORDER BY pic.impuesto_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT piv.impuesto_id, i.codigo, i.nombre, i.porcentaje, i.valor AS valor_fijo, i.tipo AS tipo_calculo, piv.valor_impuesto
         FROM public.producto_impuesto_venta piv
         JOIN public.impuesto i ON i.id_impuesto = piv.impuesto_id
         WHERE piv.producto_id = $1 AND piv.estado = 'activo'
         ORDER BY piv.impuesto_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT plp.lista_precio_id, lp.nombre AS nombre_lista, plp.precio_base, plp.utilidad_porcentaje, plp.utilidad_valor, plp.precio_venta, plp.estado
         FROM public.producto_lista_precio plp
         JOIN public.lista_precio lp ON lp.id_lista_precio = plp.lista_precio_id
         WHERE plp.producto_id = $1 AND plp.estado = 'activo'
         ORDER BY plp.lista_precio_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT pr.retencion_id, r.nombre AS nombre_retencion, pr.tipo, pr.porcentaje, pr.valor_fijo, pr.estado
         FROM public.producto_retencion pr
         JOIN public.retencion r ON r.id_retencion = pr.retencion_id
         WHERE pr.producto_id = $1 AND pr.estado = 'activo'
         ORDER BY pr.retencion_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT id_producto_referencia AS id, referencia, descripcion, estado
         FROM public.producto_referencia
         WHERE producto_id = $1 AND estado = 'activo'
         ORDER BY id_producto_referencia ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT id_producto_codigo_barras AS id, codigo_barras, descripcion, principal, estado
         FROM public.producto_codigo_barras
         WHERE producto_id = $1 AND estado = 'activo'
         ORDER BY id_producto_codigo_barras ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT pp.proveedor_id, COALESCE(t.razon_social, t.nombre || ' ' || COALESCE(t.apellido, '')) AS nombre_proveedor, pp.referencia_proveedor, pp.principal
         FROM public.producto_proveedor pp
         JOIN public.tercero t ON t.id_tercero = pp.proveedor_id
         WHERE pp.producto_id = $1;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT titulo_seo, slug, descripcion_seo, palabras_clave, indexable
         FROM public.producto_seo_ia
         WHERE producto_id = $1
         LIMIT 1;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT id_producto_imagen AS id, url, nombre, orden, principal
         FROM public.producto_imagen
         WHERE producto_id = $1 AND estado = 'activo'
         ORDER BY principal DESC, orden ASC, id_producto_imagen ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT
           pa.id_producto_atributo,
           pa.atributo_id AS id_atributo,
           a.nombre,
           a.codigo,
           pa.obligatorio,
           pa.orden,
           COALESCE(
             ARRAY_AGG(pac.atributo_componente_id) FILTER (WHERE pac.atributo_componente_id IS NOT NULL),
             '{}'
           ) AS componentes_seleccionados
         FROM public.producto_atributo pa
         JOIN public.atributo a ON a.id_atributo = pa.atributo_id
         LEFT JOIN public.producto_atributo_componente pac ON pac.producto_atributo_id = pa.id_producto_atributo AND pac.estado = 'activo'
         WHERE pa.producto_id = $1 AND pa.estado = 'activo'
         GROUP BY pa.id_producto_atributo, pa.atributo_id, a.nombre, a.codigo, pa.obligatorio, pa.orden
         ORDER BY pa.orden ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT
           pv.id_producto_variante AS id,
           pv.sku,
           pv.codigo_barras,
           pv.referencia,
           pv.precio,
           pv.estado,
           COALESCE(
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id_atributo_componente', ac.id_atributo_componente,
                 'componenteId', ac.id_atributo_componente,
                 'nombre', ac.nombre,
                 'atributoId', a.id_atributo,
                 'atributoNombre', a.nombre
               )
             ) FILTER (WHERE ac.id_atributo_componente IS NOT NULL),
             '[]'::json
           ) AS componentes
         FROM public.producto_variante pv
         LEFT JOIN public.variante_componente vc ON vc.producto_variante_id = pv.id_producto_variante
         LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = vc.atributo_componente_id
         LEFT JOIN public.atributo a ON a.id_atributo = ac.atributo_id
         WHERE pv.producto_id = $1 AND pv.estado = 'activo'
         GROUP BY pv.id_producto_variante, pv.sku, pv.codigo_barras, pv.referencia, pv.precio, pv.estado
         ORDER BY pv.id_producto_variante ASC;`,
        [productoId],
      ),
    ]);

    const seo = seoIa[0] || {};

    return {
      id: Number(prod.id_producto),
      id_producto: Number(prod.id_producto),
      codigo_interno: prod.codigo_interno || '',
      nombre: prod.nombre || '',
      referencia: prod.referencia_principal || prod.codigo_interno || '',
      categoria_id: prod.categoria_id ? String(prod.categoria_id) : '',
      categoria: prod.categoria_nombre || '',
      subcategoria_id: prod.subcategoria_id ? String(prod.subcategoria_id) : '',
      subcategoria: prod.subcategoria_nombre || '',
      marca_id: prod.marca_id ? String(prod.marca_id) : '',
      marca: prod.marca_nombre || '',
      descripcion_corta: prod.descripcion_corta || '',
      descripcion_larga: prod.descripcion_larga || '',
      ficha_tecnica: prod.ficha_tecnica || '',
      estado_producto: prod.estado_producto || 'activo',
      estado_publicacion: prod.estado_publicacion || 'publicado',

      costo_base: Number(prod.costo_base) || 0,
      costo_impuesto: Number(prod.costo_impuesto) || 0,
      precio_base: Number(prod.precio_base) || 0,
      precio_impuesto: Number(prod.precio_impuesto) || 0,
      utilidad_valor: Number(prod.utilidad_valor) || 0,
      utilidad_bruta: Math.round(((Number(prod.precio_impuesto) || 0) - (Number(prod.costo_impuesto) || 0)) * 100) / 100,
      utilidad_porcentaje: Number(prod.utilidad_porcentaje) || 0,

      impuestos_compra: impuestosCompra.map((i: any) => ({
        id: Number(i.impuesto_id),
        impuesto_id: Number(i.impuesto_id),
        codigo: i.codigo,
        nombre: i.nombre,
        tipo_calculo: i.tipo_calculo || 'PORCENTAJE',
        porcentaje: Number(i.porcentaje) || 0,
        valor_fijo: Number(i.valor_fijo) || 0,
        valor_impuesto: Number(i.valor_impuesto) || 0,
      })),
      impuestos_venta: impuestosVenta.map((i: any) => ({
        id: Number(i.impuesto_id),
        impuesto_id: Number(i.impuesto_id),
        codigo: i.codigo,
        nombre: i.nombre,
        tipo_calculo: i.tipo_calculo || 'PORCENTAJE',
        porcentaje: Number(i.porcentaje) || 0,
        valor_fijo: Number(i.valor_fijo) || 0,
        valor_impuesto: Number(i.valor_impuesto) || 0,
      })),
      listas_precios: listasPrecios.map((lp: any) => ({
        id: Number(lp.lista_precio_id),
        lista_precio_id: String(lp.lista_precio_id),
        nombre_lista: lp.nombre_lista,
        precio_base: Number(lp.precio_base) || 0,
        utilidad_porcentaje: Number(lp.utilidad_porcentaje) || 0,
        utilidad_valor: Number(lp.utilidad_valor) || 0,
        precio_venta: Number(lp.precio_venta) || 0,
        estado: lp.estado,
      })),
      retenciones: retenciones.map((r: any) => ({
        id: Number(r.retencion_id),
        retencion_id: String(r.retencion_id),
        nombre_retencion: r.nombre_retencion,
        tipo: r.tipo || 'PORCENTAJE',
        porcentaje: Number(r.porcentaje) || 0,
        valor_fijo: Number(r.valor_fijo) || 0,
        estado: r.estado,
      })),

      maneja_inventario: Boolean(prod.maneja_inventario),
      tipo_inventario_id: prod.tipo_inventario_id ? String(prod.tipo_inventario_id) : '',
      medida_id: prod.medida_id ? String(prod.medida_id) : '',
      presentacion: prod.presentacion || '',
      stock_minimo: Number(prod.stock_minimo) || 0,
      stock_maximo: Number(prod.stock_maximo) || 0,
      existencia_inicial: Number(prod.existencia_actual) || 0,

      referencias: referencias.map((r: any) => ({
        id: Number(r.id),
        referencia: r.referencia,
        descripcion: r.descripcion || '',
        estado: r.estado || 'activo',
      })),
      codigos_barras: codigosBarras.map((cb: any) => ({
        id: Number(cb.id),
        codigo_barras: cb.codigo_barras,
        tipo: cb.tipo || 'EAN-13 Comercial',
        descripcion: cb.descripcion || '',
        principal: Boolean(cb.principal),
        estado: cb.estado || 'activo',
      })),
      proveedores: proveedores.map((pv: any) => ({
        id: Number(pv.proveedor_id),
        proveedor_id: String(pv.proveedor_id),
        nombre_proveedor: pv.nombre_proveedor,
        referencia_proveedor: pv.referencia_proveedor || '',
        principal: Boolean(pv.principal),
      })),

      atributos_asignados: atributosAsignados.map((a: any) => ({
        id_atributo: Number(a.id_atributo),
        nombre: a.nombre,
        codigo: a.codigo,
        obligatorio: Boolean(a.obligatorio),
        orden: Number(a.orden) || 1,
        componentes_seleccionados: (a.componentes_seleccionados || []).map(Number),
      })),
      variantes: variantes.map((v: any) => ({
        id: Number(v.id),
        sku: v.sku,
        combinacion: Array.isArray(v.componentes)
          ? v.componentes.map((c: any) => `${c.atributoNombre || ''}: ${c.nombre || ''}`).filter(Boolean).join(' | ')
          : '',
        componentes: v.componentes,
        codigo_barras: v.codigo_barras || '',
        referencia: v.referencia || '',
        precio: Number(v.precio) || 0,
        stock: Number(prod.disponible) || 0,
        estado: v.estado || 'activo',
      })),

      titulo_seo: seo.titulo_seo || '',
      slug: seo.slug || '',
      descripcion_seo: seo.descripcion_seo || '',
      palabras_clave: seo.palabras_clave || '',
      indexable: seo.indexable !== undefined ? Boolean(seo.indexable) : true,

      imagenes: imagenes.map((img: any) => ({
        id: Number(img.id),
        url: img.url,
        nombre: img.nombre || '',
        principal: Boolean(img.principal),
        orden: Number(img.orden) || 1,
      })),

      fb_product_id: prod.fb_product_id,
      meta_sync_status: prod.meta_sync_status,
      meta_sync_error: prod.meta_sync_error,
      meta_synced_at: prod.meta_synced_at,
    };
  }
}
