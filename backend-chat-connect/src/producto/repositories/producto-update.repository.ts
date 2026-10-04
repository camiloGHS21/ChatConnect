import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateProductoDto } from '../dto/update-producto.dto.js';
import { resolverUrlPublicaImagen } from './image-upload.helper.js';
import { MetaCatalogRepository } from './meta-catalog.repository.js';
import { ProductoQueryRepository } from './producto-query.repository.js';

@Injectable()
export class ProductoUpdateRepository {
  private readonly logger = new Logger(ProductoUpdateRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaCatalogRepo: MetaCatalogRepository,
    private readonly productoQueryRepo: ProductoQueryRepository,
  ) { }

  /**
   * Actualiza completamente un producto y sus entidades dependientes.
   */
  async actualizarProducto(productoId: number, dto: UpdateProductoDto, empresaId = 1) {
    const oldRows = await this.dataSource.query(
      `SELECT
         p.id_producto, p.codigo_interno, p.nombre, p.descripcion_corta, p.descripcion_larga,
         p.ficha_tecnica, p.costo_base, p.costo_impuesto, p.precio_base, p.precio_impuesto,
         p.utilidad_valor, p.utilidad_porcentaje, p.maneja_inventario, p.stock_minimo, p.stock_maximo,
         p.presentacion, p.estado_producto, p.estado_publicacion, p.fb_product_id,
         p.categoria_id, p.subcategoria_id, p.marca_id, p.tipo_inventario_id, p.medida_id,
         COALESCE(m.nombre, '') AS marca_nombre,
         COALESCE(c.nombre, '') AS categoria_nombre,
         COALESCE(sc.nombre, '') AS subcategoria_nombre,
         img.url AS imagen_url,
         GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible
       FROM public.producto p
       LEFT JOIN public.marca m ON m.id_marca = p.marca_id
       LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
       LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
       LEFT JOIN LATERAL (
         SELECT url FROM public.producto_imagen
         WHERE producto_id = p.id_producto AND estado = 'activo'
         ORDER BY principal DESC, orden ASC, id_producto_imagen ASC LIMIT 1
       ) img ON true
       LEFT JOIN (
         SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
         FROM public.inventario WHERE empresa_id = $1 GROUP BY producto_id
       ) inv ON inv.producto_id = p.id_producto
       WHERE p.id_producto = $2 AND p.empresa_id = $1
       LIMIT 1;`,
      [empresaId, productoId],
    );

    const oldProd = oldRows[0];
    if (!oldProd) {
      throw new NotFoundException(`El producto con ID ${productoId} no fue encontrado`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const costoBase = dto.costo_base !== undefined ? Number(dto.costo_base) : Number(oldProd.costo_base);
      const costoImpuesto = dto.costo_impuesto !== undefined ? Number(dto.costo_impuesto) : Number(oldProd.costo_impuesto);
      const precioBase = dto.precio_base !== undefined ? Number(dto.precio_base) : Number(oldProd.precio_base);
      const precioImpuesto = dto.precio_impuesto !== undefined ? Number(dto.precio_impuesto) : Number(oldProd.precio_impuesto);
      const utilidadValor = dto.utilidad_valor !== undefined ? Number(dto.utilidad_valor) : Number(oldProd.utilidad_valor);
      const utilidadPorcentaje = dto.utilidad_porcentaje !== undefined ? Number(dto.utilidad_porcentaje) : Number(oldProd.utilidad_porcentaje);

      // 1. Actualizar tabla principal producto
      await queryRunner.query(
        `UPDATE public.producto
         SET
           categoria_id = COALESCE($1, categoria_id),
           subcategoria_id = COALESCE($2, subcategoria_id),
           marca_id = COALESCE($3, marca_id),
           nombre = COALESCE($4, nombre),
           descripcion_corta = COALESCE($5, descripcion_corta),
           descripcion_larga = COALESCE($6, descripcion_larga),
           ficha_tecnica = COALESCE($7, ficha_tecnica),
           costo_base = $8,
           costo_impuesto = $9,
           precio_base = $10,
           precio_impuesto = $11,
           utilidad_valor = $12,
           utilidad_porcentaje = $13,
           maneja_inventario = COALESCE($14, maneja_inventario),
           tipo_inventario_id = COALESCE($15, tipo_inventario_id),
           stock_minimo = COALESCE($16, stock_minimo),
           stock_maximo = COALESCE($17, stock_maximo),
           medida_id = COALESCE($18, medida_id),
           presentacion = COALESCE($19, presentacion),
           estado_producto = COALESCE($20, estado_producto),
           estado_publicacion = COALESCE($21, estado_publicacion),
           updated_at = NOW()
         WHERE id_producto = $22 AND empresa_id = $23;`,
        [
          dto.categoria_id !== undefined ? (dto.categoria_id ? Number(dto.categoria_id) : null) : null,
          dto.subcategoria_id !== undefined ? (dto.subcategoria_id ? Number(dto.subcategoria_id) : null) : null,
          dto.marca_id !== undefined ? (dto.marca_id ? Number(dto.marca_id) : null) : null,
          dto.nombre !== undefined ? dto.nombre.trim() : null,
          dto.descripcion_corta !== undefined ? dto.descripcion_corta : null,
          dto.descripcion_larga !== undefined ? dto.descripcion_larga : null,
          dto.ficha_tecnica !== undefined ? dto.ficha_tecnica : null,
          costoBase,
          costoImpuesto,
          precioBase,
          precioImpuesto,
          utilidadValor,
          utilidadPorcentaje,
          dto.maneja_inventario !== undefined ? Boolean(dto.maneja_inventario) : null,
          dto.tipo_inventario_id !== undefined ? (dto.tipo_inventario_id ? Number(dto.tipo_inventario_id) : null) : null,
          dto.stock_minimo !== undefined ? Number(dto.stock_minimo) : null,
          dto.stock_maximo !== undefined ? Number(dto.stock_maximo) : null,
          dto.medida_id !== undefined ? (dto.medida_id ? Number(dto.medida_id) : null) : null,
          dto.presentacion !== undefined ? dto.presentacion : null,
          dto.estado_producto !== undefined ? dto.estado_producto : null,
          dto.estado_publicacion !== undefined ? dto.estado_publicacion : null,
          productoId,
          empresaId,
        ],
      );

      // 2. Inventario
      if (dto.existencia_inicial !== undefined) {
        await queryRunner.query(
          `INSERT INTO public.inventario (empresa_id, producto_id, existencia, reservado)
           VALUES ($1, $2, $3, 0)
           ON CONFLICT (empresa_id, producto_id) DO UPDATE SET existencia = EXCLUDED.existencia;`,
          [empresaId, productoId, Number(dto.existencia_inicial) || 0],
        );
      }

      // 3. Impuestos Compra
      if (dto.impuestos_compra !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id = $1;`, [productoId]);
        for (const imp of dto.impuestos_compra) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_compra (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo') ON CONFLICT DO NOTHING;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 4. Impuestos Venta
      if (dto.impuestos_venta !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id = $1;`, [productoId]);
        for (const imp of dto.impuestos_venta) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_venta (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo') ON CONFLICT DO NOTHING;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 5. Listas de Precios
      if (dto.listas_precios !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_lista_precio WHERE producto_id = $1;`, [productoId]);
        for (const lp of dto.listas_precios) {
          if (lp.lista_precio_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_lista_precio (producto_id, lista_precio_id, precio_base, utilidad_valor, utilidad_porcentaje, precio_venta, estado)
               VALUES ($1, $2, $3, $4, $5, $6, 'activo');`,
              [
                productoId,
                Number(lp.lista_precio_id),
                Number(lp.precio_base) || precioBase,
                Number(lp.utilidad_valor) || utilidadValor,
                Number(lp.utilidad_porcentaje) || utilidadPorcentaje,
                Number(lp.precio_venta) || precioImpuesto,
              ],
            );
          }
        }
      }

      // 6. Retenciones (base >= 500.000 COP)
      if (dto.retenciones !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_retencion WHERE producto_id = $1;`, [productoId]);
        const baseRet = Math.max(precioBase, precioImpuesto, costoBase);
        if (baseRet >= 500000) {
          for (const ret of dto.retenciones) {
            if (ret.retencion_id) {
              await queryRunner.query(
                `INSERT INTO public.producto_retencion (producto_id, retencion_id, tipo, porcentaje, valor_fijo, estado)
                 VALUES ($1, $2, $3, $4, $5, 'activo') ON CONFLICT DO NOTHING;`,
                [
                  productoId,
                  Number(ret.retencion_id),
                  ret.tipo || 'PORCENTAJE',
                  ret.tipo === 'PORCENTAJE' ? Number(ret.porcentaje) || 0 : null,
                  ret.tipo === 'VALOR_FIJO' ? Number(ret.valor_fijo) || 0 : null,
                ],
              );
            }
          }
        }
      }

      // 7. Referencias
      if (dto.referencias !== undefined || dto.referencia !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_referencia WHERE producto_id = $1;`, [productoId]);
        const refsToInsert: { referencia: string; descripcion?: string | null; estado?: string | null }[] = [];
        if (dto.referencia && typeof dto.referencia === 'string' && dto.referencia.trim()) {
          refsToInsert.push({ referencia: dto.referencia.trim(), descripcion: 'Referencia principal', estado: 'activo' });
        }
        if (dto.referencias && Array.isArray(dto.referencias)) {
          for (const r of dto.referencias) {
            const code = (r.referencia || '').trim();
            if (code && !refsToInsert.some(item => item.referencia.toLowerCase() === code.toLowerCase())) {
              refsToInsert.push({ referencia: code, descripcion: r.descripcion || null, estado: r.estado || 'activo' });
            }
          }
        }
        for (const ref of refsToInsert) {
          await queryRunner.query(
            `INSERT INTO public.producto_referencia (producto_id, referencia, descripcion, estado)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING;`,
            [productoId, ref.referencia, ref.descripcion || null, ref.estado || 'activo'],
          );
        }
      }

      // 8. Códigos de barras
      if (dto.codigos_barras !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id = $1;`, [productoId]);
        for (const cb of dto.codigos_barras) {
          if (cb.codigo_barras && cb.codigo_barras.trim()) {
            await queryRunner.query(
              `INSERT INTO public.producto_codigo_barras (producto_id, codigo_barras, descripcion, principal, estado)
               VALUES ($1, $2, $3, $4, 'activo');`,
              [productoId, cb.codigo_barras.trim(), cb.descripcion || null, Boolean(cb.principal)],
            );
          }
        }
      }

      // 9. Proveedores
      if (dto.proveedores !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_proveedor WHERE producto_id = $1;`, [productoId]);
        for (const prov of dto.proveedores) {
          if (prov.proveedor_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_proveedor (producto_id, proveedor_id, referencia_proveedor, principal)
               VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING;`,
              [productoId, Number(prov.proveedor_id), prov.referencia_proveedor || null, prov.principal !== undefined ? Boolean(prov.principal) : true],
            );
          }
        }
      }

      // 10. SEO
      if (dto.titulo_seo !== undefined || dto.descripcion_seo !== undefined || dto.palabras_clave !== undefined || dto.slug !== undefined) {
        const slug = dto.slug && dto.slug.trim()
          ? dto.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : `${(dto.nombre || oldProd.nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productoId}`;
        await queryRunner.query(
          `INSERT INTO public.producto_seo_ia (producto_id, titulo_seo, descripcion_seo, palabras_clave, slug, indexable)
           VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (producto_id) DO UPDATE SET titulo_seo = EXCLUDED.titulo_seo, descripcion_seo = EXCLUDED.descripcion_seo;`,
          [productoId, dto.titulo_seo || dto.nombre || oldProd.nombre, dto.descripcion_seo || null, dto.palabras_clave || null, slug],
        );
      }

      // 11. Imágenes
      if (dto.imagenes !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_imagen WHERE producto_id = $1;`, [productoId]);
        for (let i = 0; i < dto.imagenes.length; i++) {
          const img = dto.imagenes[i];
          if (img.url) {
            const publicUrl = await resolverUrlPublicaImagen(img.url);
            await queryRunner.query(
              `INSERT INTO public.producto_imagen (producto_id, url, nombre, orden, principal, estado)
               VALUES ($1, $2, $3, $4, $5, 'activo');`,
              [productoId, publicUrl || img.url, img.nombre || `Imagen ${i + 1}`, Number(img.orden) || i + 1, Boolean(img.principal !== undefined ? img.principal : i === 0)],
            );
          }
        }
      }

      // 12. Atributos y componentes
      if (dto.atributos_asignados !== undefined) {
        const oldProdAttrs = await queryRunner.query(
          `SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id = $1;`,
          [productoId],
        );
        const oldAttrIds = oldProdAttrs.map((r: any) => r.id_producto_atributo);
        if (oldAttrIds.length > 0) {
          await queryRunner.query(
            `DELETE FROM public.producto_atributo_componente WHERE producto_atributo_id = ANY($1);`,
            [oldAttrIds],
          );
        }
        await queryRunner.query(`DELETE FROM public.producto_atributo WHERE producto_id = $1;`, [productoId]);

        for (const attr of dto.atributos_asignados) {
          if (attr.id_atributo) {
            const attrRes = await queryRunner.query(
              `INSERT INTO public.producto_atributo (producto_id, atributo_id, obligatorio, orden, estado)
               VALUES ($1, $2, $3, $4, 'activo') RETURNING id_producto_atributo;`,
              [productoId, Number(attr.id_atributo), Boolean(attr.obligatorio), Number(attr.orden) || 1],
            );
            const prodAttrId = attrRes[0]?.id_producto_atributo;
            if (prodAttrId && attr.componentes_seleccionados && attr.componentes_seleccionados.length > 0) {
              for (let ci = 0; ci < attr.componentes_seleccionados.length; ci++) {
                const cId = Number(attr.componentes_seleccionados[ci]);
                if (!isNaN(cId)) {
                  await queryRunner.query(
                    `INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
                     VALUES ($1, $2, $3, 'activo') ON CONFLICT DO NOTHING;`,
                    [prodAttrId, cId, ci + 1],
                  );
                }
              }
            }
          }
        }
      }

      // 13. Variantes
      if (dto.variantes !== undefined) {
        const currentVars = await queryRunner.query(
          `SELECT id_producto_variante FROM public.producto_variante WHERE producto_id = $1;`,
          [productoId],
        );
        const varIds = currentVars.map((v: any) => v.id_producto_variante);
        if (varIds.length > 0) {
          await queryRunner.query(`DELETE FROM public.variante_componente WHERE producto_variante_id = ANY($1);`, [varIds]);
        }
        await queryRunner.query(`DELETE FROM public.producto_variante WHERE producto_id = $1;`, [productoId]);

        for (const v of dto.variantes) {
          if (v.sku) {
            const varRes = await queryRunner.query(
              `INSERT INTO public.producto_variante (producto_id, sku, codigo_barras, referencia, precio, estado)
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_producto_variante;`,
              [productoId, v.sku.trim(), v.codigo_barras || null, v.referencia || null, Number(v.precio) || precioImpuesto, v.estado || 'activo'],
            );
            const varId = varRes[0]?.id_producto_variante;
            if (varId && v.componentes && Array.isArray(v.componentes)) {
              for (const c of v.componentes) {
                const compId = Number(c.componenteId || c.id_atributo_componente || c.comp_id || c.id);
                if (compId && !isNaN(compId)) {
                  await queryRunner.query(
                    `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                     VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
                    [varId, compId],
                  );
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (err: any) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      this.logger.error(`Error actualizando producto ${productoId}: ${err.message}`, err.stack);
      throw new BadRequestException(err.message || 'Error al actualizar el producto');
    } finally {
      if (!queryRunner.isReleased) await queryRunner.release();
    }

    // 14. Sincronización diferencial en Meta
    try {
      const updatedRows = await this.dataSource.query(
        `SELECT p.id_producto, p.codigo_interno, p.nombre, p.descripcion_corta, p.descripcion_larga,
                p.precio_base, p.precio_impuesto,
                COALESCE(
                  (SELECT pr.referencia FROM public.producto_referencia pr WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo' ORDER BY pr.id_producto_referencia ASC LIMIT 1),
                  p.codigo_interno
                ) AS referencia_principal
         FROM public.producto p WHERE p.id_producto = $1;`,
        [productoId],
      );
      if (updatedRows[0]) {
        await this.metaCatalogRepo.sincronizarDiferencialMeta(updatedRows[0], empresaId);
      }
    } catch (metaErr: any) {
      this.logger.warn(`Error en sync diferencial tras actualizar producto: ${metaErr.message}`);
    }

    return await this.productoQueryRepo.getProductoPorId(productoId, empresaId);
  }
}
