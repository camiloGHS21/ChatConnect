import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto.js';
import { resolverUrlPublicaImagen } from './image-upload.helper.js';
import { MetaCatalogRepository } from './meta-catalog.repository.js';

@Injectable()
export class ProductoCreateRepository {
  private readonly logger = new Logger(ProductoCreateRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaCatalogRepo: MetaCatalogRepository,
  ) { }

  /**
   * Persiste un producto completo con todas sus entidades hijas en una única transacción atómica.
   */
  async crearProducto(dto: CreateProductoDto, empresaId = 1) {
    if (!dto.nombre || !dto.nombre.trim()) {
      throw new BadRequestException('El nombre del producto es obligatorio');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Asignación del código interno
      if (!dto.codigo_interno || !dto.codigo_interno.trim()) {
        const codigoGen = await queryRunner.query(
          `SELECT public.generar_codigo_producto($1) AS codigo;`,
          [empresaId],
        );
        dto.codigo_interno = codigoGen[0]?.codigo;
      } else {
        const existingProduct = await queryRunner.query(
          `SELECT id_producto FROM public.producto WHERE empresa_id = $1 AND codigo_interno = $2 LIMIT 1;`,
          [empresaId, dto.codigo_interno.trim()],
        );
        if (existingProduct && existingProduct.length > 0) {
          throw new BadRequestException(`El código interno '${dto.codigo_interno}' ya se encuentra registrado`);
        }
      }

      const costoBase = Number(dto.costo_base) || 0;
      const costoImpuesto = Number(dto.costo_impuesto) || costoBase;
      const precioBase = Number(dto.precio_base) || 0;
      const precioImpuesto = Number(dto.precio_impuesto) || precioBase;
      const utilidadValor = Number(dto.utilidad_valor) || Math.max(0, precioBase - costoBase);
      const utilidadPorcentaje =
        Number(dto.utilidad_porcentaje) || (costoBase > 0 ? ((precioBase - costoBase) / costoBase) * 100 : 0);

      let medidaIdFinal = dto.medida_id ? Number(dto.medida_id) : null;
      if (!medidaIdFinal) {
        const medida94 = await queryRunner.query(
          `SELECT id_medida FROM public.medida WHERE empresa_id = $1 AND codigo = '94' LIMIT 1;`,
          [empresaId],
        );
        if (medida94 && medida94.length > 0) {
          medidaIdFinal = Number(medida94[0].id_medida);
        }
      }

      // Inserción en producto
      const prodResult = await queryRunner.query(
        `INSERT INTO public.producto (
           empresa_id, categoria_id, subcategoria_id, marca_id,
           codigo_interno, nombre, descripcion_corta, descripcion_larga, ficha_tecnica,
           costo_base, costo_impuesto, precio_base, precio_impuesto, utilidad_valor, utilidad_porcentaje,
           maneja_inventario, tipo_inventario_id, stock_minimo, stock_maximo,
           medida_id, presentacion, estado_producto, estado_publicacion
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
         RETURNING *;`,
        [
          empresaId,
          dto.categoria_id ? Number(dto.categoria_id) : null,
          dto.subcategoria_id ? Number(dto.subcategoria_id) : null,
          dto.marca_id ? Number(dto.marca_id) : null,
          dto.codigo_interno ? dto.codigo_interno.trim() : null,
          dto.nombre.trim(),
          dto.descripcion_corta || null,
          dto.descripcion_larga || null,
          dto.ficha_tecnica || null,
          costoBase,
          costoImpuesto,
          precioBase,
          precioImpuesto,
          utilidadValor,
          utilidadPorcentaje,
          dto.maneja_inventario !== undefined ? Boolean(dto.maneja_inventario) : true,
          dto.tipo_inventario_id ? Number(dto.tipo_inventario_id) : null,
          Number(dto.stock_minimo) || 0,
          Number(dto.stock_maximo) || 0,
          medidaIdFinal,
          dto.presentacion || null,
          dto.estado_producto || 'activo',
          dto.estado_publicacion || 'publicado',
        ],
      );

      const producto = prodResult[0];
      const productoId = producto.id_producto;

      // 2. Impuestos de Compra
      if (dto.impuestos_compra && dto.impuestos_compra.length > 0) {
        for (const imp of dto.impuestos_compra) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_compra (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo')
               ON CONFLICT (producto_id, impuesto_id) DO NOTHING;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 3. Impuestos de Venta
      if (dto.impuestos_venta && dto.impuestos_venta.length > 0) {
        for (const imp of dto.impuestos_venta) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_venta (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo')
               ON CONFLICT (producto_id, impuesto_id) DO NOTHING;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 4. Listas de Precios
      if (dto.listas_precios && dto.listas_precios.length > 0) {
        for (const lp of dto.listas_precios) {
          if (lp.lista_precio_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_lista_precio (
                 producto_id, lista_precio_id, precio_base, utilidad_valor, utilidad_porcentaje, precio_venta, estado
               ) VALUES ($1, $2, $3, $4, $5, $6, 'activo')
               ON CONFLICT (producto_id, lista_precio_id) DO UPDATE SET
                 precio_base = EXCLUDED.precio_base,
                 precio_venta = EXCLUDED.precio_venta;`,
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

      // 5. Retenciones (base >= 500.000 COP)
      const baseRetencionCrear = Math.max(
        Number(dto.precio_base || 0),
        Number(dto.precio_impuesto || 0),
        Number(dto.costo_base || 0),
      );
      if (baseRetencionCrear >= 500000 && dto.retenciones && dto.retenciones.length > 0) {
        for (const ret of dto.retenciones) {
          if (ret.retencion_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_retencion (
                 producto_id, retencion_id, tipo, porcentaje, valor_fijo, estado
               ) VALUES ($1, $2, $3, $4, $5, 'activo')
               ON CONFLICT (producto_id, retencion_id) DO NOTHING;`,
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

      // 6. Referencias
      const referenciasToInsert: { referencia: string; descripcion?: string | null; estado?: string | null }[] = [];
      if (dto.referencia && typeof dto.referencia === 'string' && dto.referencia.trim()) {
        referenciasToInsert.push({ referencia: dto.referencia.trim(), descripcion: 'Referencia principal', estado: 'activo' });
      }
      if (dto.referencias && Array.isArray(dto.referencias)) {
        for (const r of dto.referencias) {
          const code = (r.referencia || '').trim();
          if (code && !referenciasToInsert.some(item => item.referencia.toLowerCase() === code.toLowerCase())) {
            referenciasToInsert.push({
              referencia: code,
              descripcion: r.descripcion || null,
              estado: r.estado || 'activo',
            });
          }
        }
      }
      for (const ref of referenciasToInsert) {
        await queryRunner.query(
          `INSERT INTO public.producto_referencia (producto_id, referencia, descripcion, estado)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (producto_id, referencia) DO NOTHING;`,
          [productoId, ref.referencia, ref.descripcion || null, ref.estado || 'activo'],
        );
      }

      // 7. Códigos de Barras
      if (dto.codigos_barras && dto.codigos_barras.length > 0) {
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

      // 8. Proveedores
      if (dto.proveedores && dto.proveedores.length > 0) {
        for (const prov of dto.proveedores) {
          if (prov.proveedor_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_proveedor (producto_id, proveedor_id, referencia_proveedor, principal)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (producto_id, proveedor_id) DO NOTHING;`,
              [
                productoId,
                Number(prov.proveedor_id),
                prov.referencia_proveedor || null,
                prov.principal !== undefined ? Boolean(prov.principal) : true,
              ],
            );
          }
        }
      }

      // 9. SEO
      if (dto.titulo_seo || dto.descripcion_seo || dto.palabras_clave || dto.slug) {
        const slug =
          dto.slug && dto.slug.trim()
            ? dto.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : `${dto.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productoId}`;

        await queryRunner.query(
          `INSERT INTO public.producto_seo_ia (
             producto_id, titulo_seo, descripcion_seo, palabras_clave, slug, indexable
           ) VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (producto_id) DO UPDATE SET
             titulo_seo = EXCLUDED.titulo_seo,
             descripcion_seo = EXCLUDED.descripcion_seo;`,
          [productoId, dto.titulo_seo || dto.nombre, dto.descripcion_seo || null, dto.palabras_clave || null, slug],
        );
      }

      // 10. Imágenes
      if (dto.imagenes && dto.imagenes.length > 0) {
        for (let i = 0; i < dto.imagenes.length; i++) {
          const img = dto.imagenes[i];
          if (img.url) {
            const publicUrl = await resolverUrlPublicaImagen(img.url);
            await queryRunner.query(
              `INSERT INTO public.producto_imagen (producto_id, url, nombre, orden, principal, estado)
               VALUES ($1, $2, $3, $4, $5, 'activo');`,
              [
                productoId,
                publicUrl || img.url,
                img.nombre || `Imagen ${i + 1}`,
                Number(img.orden) || i + 1,
                Boolean(img.principal !== undefined ? img.principal : i === 0),
              ],
            );
          }
        }
      }

      // 11. Atributos
      if (dto.atributos_asignados && dto.atributos_asignados.length > 0) {
        for (const attr of dto.atributos_asignados) {
          if (attr.id_atributo) {
            const attrRes = await queryRunner.query(
              `INSERT INTO public.producto_atributo (producto_id, atributo_id, obligatorio, orden, estado)
               VALUES ($1, $2, $3, $4, 'activo')
               ON CONFLICT (producto_id, atributo_id) DO UPDATE SET obligatorio = EXCLUDED.obligatorio
               RETURNING id_producto_atributo;`,
              [productoId, Number(attr.id_atributo), Boolean(attr.obligatorio), Number(attr.orden) || 1],
            );
            const prodAttrId = attrRes[0]?.id_producto_atributo;
            if (prodAttrId && attr.componentes_seleccionados && attr.componentes_seleccionados.length > 0) {
              for (let ci = 0; ci < attr.componentes_seleccionados.length; ci++) {
                const cId = Number(attr.componentes_seleccionados[ci]);
                if (!isNaN(cId)) {
                  await queryRunner.query(
                    `INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
                     VALUES ($1, $2, $3, 'activo')
                     ON CONFLICT DO NOTHING;`,
                    [prodAttrId, cId, ci + 1],
                  );
                }
              }
            }
          }
        }
      }

      // 12. Variantes
      if (dto.variantes && dto.variantes.length > 0) {
        for (const v of dto.variantes) {
          if (v.sku) {
            const varRes = await queryRunner.query(
              `INSERT INTO public.producto_variante (producto_id, sku, codigo_barras, referencia, precio, estado)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id_producto_variante;`,
              [
                productoId,
                v.sku.trim(),
                v.codigo_barras || null,
                v.referencia || null,
                Number(v.precio) || precioImpuesto,
                v.estado || 'activo',
              ],
            );
            const varId = varRes[0]?.id_producto_variante;
            if (varId) {
              const insertedCompIds = new Set<number>();
              if (v.componentes && Array.isArray(v.componentes)) {
                for (const c of v.componentes) {
                  const compId = Number(c.componenteId || c.id_atributo_componente || c.comp_id || c.id);
                  if (compId && !isNaN(compId)) {
                    await queryRunner.query(
                      `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                       VALUES ($1, $2)
                       ON CONFLICT DO NOTHING;`,
                      [varId, compId],
                    );
                    insertedCompIds.add(compId);
                  }
                }
              }
              if (insertedCompIds.size === 0) {
                const assignedComps = await queryRunner.query(
                  `SELECT pac.atributo_componente_id, ac.nombre, ac.codigo
                   FROM public.producto_atributo_componente pac
                   JOIN public.producto_atributo pa ON pa.id_producto_atributo = pac.producto_atributo_id
                   JOIN public.atributo_componente ac ON ac.id_atributo_componente = pac.atributo_componente_id
                   WHERE pa.producto_id = $1 AND pac.estado = 'activo';`,
                  [productoId],
                );
                const matchTarget = `${v.sku || ''} ${v.combinacion || ''} ${v.referencia || ''}`.toLowerCase();
                for (const ac of assignedComps) {
                  const compName = (ac.nombre || '').toLowerCase().trim();
                  const compCode = (ac.codigo || '').toLowerCase().trim();
                  if (
                    (compName && matchTarget.includes(compName)) ||
                    (compCode && matchTarget.includes(compCode)) ||
                    (compName.includes('negro') && (matchTarget.includes('neg') || matchTarget.includes('black'))) ||
                    (compName.includes('amarillo') && (matchTarget.includes('ama') || matchTarget.includes('yellow'))) ||
                    (compName.includes('blanco') && (matchTarget.includes('bla') || matchTarget.includes('white'))) ||
                    (compName.includes('azul') && (matchTarget.includes('azu') || matchTarget.includes('blue'))) ||
                    (compName.includes('20v') && matchTarget.includes('20v'))
                  ) {
                    await queryRunner.query(
                      `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                       VALUES ($1, $2)
                       ON CONFLICT DO NOTHING;`,
                      [varId, ac.atributo_componente_id],
                    );
                  }
                }
              }
            }
          }
        }
      }

      // 13. Inventario Inicial
      const existencia = Number(dto.existencia_inicial) || 0;
      await queryRunner.query(
        `INSERT INTO public.inventario (empresa_id, producto_id, existencia, reservado)
         VALUES ($1, $2, $3, 0);`,
        [empresaId, productoId, existencia],
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();
      this.logger.log(`✓ Producto creado: ID ${productoId}, Código ${producto.codigo_interno}`);

      let metaResult: any = null;
      try {
        metaResult = await this.metaCatalogRepo.sincronizarConMetaCatalog(productoId, empresaId);
      } catch (metaErr: any) {
        this.logger.error(`Error en sincronización con Meta Catalog: ${metaErr.message}`);
      }

      return {
        success: true,
        producto: {
          ...producto,
          id: Number(producto.id_producto),
          fb_product_id: metaResult?.fb_product_id || null,
          meta_sync_status: metaResult?.success ? 'sincronizado' : 'error',
        },
      };
    } catch (error: any) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      this.logger.error(`Error al crear producto: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Error al persistir el producto en la base de datos');
    } finally {
      if (!queryRunner.isReleased) await queryRunner.release();
    }
  }
}
