import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MetaCatalogRepository } from './meta-catalog.repository.js';

@Injectable()
export class ProductoDeleteRepository {
  private readonly logger = new Logger(ProductoDeleteRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaCatalogRepo: MetaCatalogRepository,
  ) { }

  /**
   * Elimina un producto de la base de datos y del catálogo de WhatsApp / Meta.
   */
  async eliminarProducto(productoId: number, empresaId = 1) {
    const prodRows = await this.dataSource.query(
      `SELECT id_producto, codigo_interno, nombre, fb_product_id
       FROM public.producto
       WHERE id_producto = $1 AND empresa_id = $2
       LIMIT 1;`,
      [productoId, empresaId],
    );

    const prod = prodRows[0];
    if (!prod) {
      throw new NotFoundException(`El producto con ID ${productoId} no fue encontrado`);
    }

    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    let deletedFromMeta = false;

    // 1. Eliminar de Meta / WhatsApp Commerce Catalog si existe fb_product_id
    if (metaToken && prod.fb_product_id) {
      try {
        this.logger.log(`[MetaCatalog] Eliminando producto ${productoId} (FB ID: ${prod.fb_product_id}) de Meta WhatsApp...`);
        const delRes = await fetch(`https://graph.facebook.com/${apiVersion}/${prod.fb_product_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${metaToken}`,
          },
        });
        const delData: any = await delRes.json();
        if (delRes.ok && (delData.success || !delData.error)) {
          deletedFromMeta = true;
          this.logger.log(`✓ [MetaCatalog] Producto ${productoId} eliminado exitosamente de Meta WhatsApp`);
        } else {
          this.logger.warn(`[MetaCatalog] Advertencia al eliminar de Meta: ${JSON.stringify(delData)}`);
        }
      } catch (metaErr: any) {
        this.logger.error(`[MetaCatalog] Error comunicando con Meta para eliminar producto: ${metaErr.message}`);
      }
    }

    // 2. Si la empresa tiene catálogo, eliminar también todas las variantes y productos asociados de Meta
    if (metaToken) {
      try {
        const canalRows = await this.dataSource.query(
          `SELECT catalog_id FROM public.canal WHERE empresa_id = $1 AND tipo = 'whatsapp' LIMIT 1;`,
          [empresaId],
        );
        const catalogId = canalRows[0]?.catalog_id;
        const retailerId = prod.codigo_interno || `PROD-${prod.id_producto}`;
        if (catalogId) {
          const varRows = await this.dataSource.query(
            `SELECT sku, referencia FROM public.producto_variante WHERE producto_id = $1;`,
            [productoId],
          );
          const retailerIdsToDelete = new Set<string>();
          if (retailerId) retailerIdsToDelete.add(retailerId);
          for (const v of varRows) {
            const vRetId = (v.sku || v.referencia || '').trim();
            if (vRetId) retailerIdsToDelete.add(vRetId);
          }

          const metaItemsRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?fields=id,retailer_id,item_group_id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          });
          const metaItemsData: any = await metaItemsRes.json();
          const metaItems = metaItemsData?.data || [];
          for (const item of metaItems) {
            if (retailerIdsToDelete.has(item.retailer_id) || item.item_group_id === retailerId || item.id === prod.fb_product_id) {
              await fetch(`https://graph.facebook.com/${apiVersion}/${item.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              });
              this.logger.log(`✓ [MetaCatalog] Item ${item.id} (${item.retailer_id}) eliminado de Meta`);
            }
          }
        }
      } catch (errVar: any) {
        this.logger.warn(`[MetaCatalog] Advertencia eliminando variantes de Meta: ${errVar.message}`);
      }
    }

    // 3. Eliminación o inactivación en PostgreSQL
    const orderRows = await this.dataSource.query(
      `SELECT count(*)::int AS count FROM public.pedido_detalle WHERE producto_id = $1;`,
      [productoId],
    );

    if (orderRows[0]?.count > 0) {
      await this.dataSource.query(
        `UPDATE public.producto
         SET estado_producto = 'inactivo',
             estado_publicacion = 'no_publicado',
             fb_product_id = NULL,
             meta_sync_status = 'eliminado',
             meta_sync_error = NULL,
             meta_synced_at = NOW(),
             updated_at = NOW()
         WHERE id_producto = $1 AND empresa_id = $2;`,
        [productoId, empresaId],
      );
      this.logger.log(`✓ Producto ${productoId} inactivado y retirado de WhatsApp (posee pedidos asociados)`);
    } else {
      await this.dataSource.query(`DELETE FROM public.variante_componente WHERE producto_variante_id IN (SELECT id_producto_variante FROM public.producto_variante WHERE producto_id = $1);`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_variante WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_atributo_componente WHERE producto_atributo_id IN (SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id = $1);`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_atributo WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_imagen WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_lista_precio WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_retencion WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_proveedor WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_seo_ia WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.carrito_detalle WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.inventario WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.precio WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_referencia WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto WHERE id_producto = $1 AND empresa_id = $2;`, [productoId, empresaId]);
      this.logger.log(`✓ Producto ${productoId} y sus dependencias eliminados completamente de PostgreSQL y de WhatsApp`);
    }

    return {
      success: true,
      message: 'Producto eliminado correctamente de la base de datos y del catálogo de WhatsApp',
      id: productoId,
      deleted_from_meta: deletedFromMeta,
    };
  }

  /**
   * Elimina TODOS los productos de la empresa tanto en PostgreSQL como en el catálogo de Meta WhatsApp.
   */
  async eliminarTodosLosProductos(empresaId = 1): Promise<{ ok: boolean; eliminados: number; meta_eliminados: number; message: string }> {
    this.logger.log(`[EliminarTodos] Iniciando vaciado total de productos para empresa ${empresaId}...`);

    let metaEliminados = 0;
    try {
      const metaToken =
        process.env.META_PERMANENT_TOKEN ||
        process.env.META_SYSTEM_TOKEN ||
        process.env.META_ACCESS_TOKEN;
      const apiVersion = process.env.META_API_VERSION || 'v21.0';

      const canalRows = await this.dataSource.query(
        `SELECT catalog_id FROM public.canal WHERE empresa_id = $1 AND tipo = 'whatsapp' LIMIT 1;`,
        [empresaId],
      );
      const catalogId = canalRows[0]?.catalog_id || process.env.META_CATALOG_ID || '912267985057130';

      if (metaToken && catalogId) {
        this.logger.log(`[EliminarTodos] Consultando productos y grupos en catálogo Meta ${catalogId}...`);
        const [metaProdsRes, metaGroupsRes] = await Promise.all([
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=1000&fields=id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups?limit=1000&fields=id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
        ]);

        const metaProdsData: any = await metaProdsRes.json();
        const metaGroupsData: any = await metaGroupsRes.json();
        const items: any[] = metaProdsData?.data || [];
        const groups: any[] = metaGroupsData?.data || [];

        this.logger.log(`[EliminarTodos] Eliminando ${items.length} productos y ${groups.length} grupos de Meta WhatsApp...`);

        const chunkSize = 10;
        for (let i = 0; i < items.length; i += chunkSize) {
          const chunk = items.slice(i, i + chunkSize);
          await Promise.all(
            chunk.map(it =>
              fetch(`https://graph.facebook.com/${apiVersion}/${it.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              }).catch(() => null)
            )
          );
          metaEliminados += chunk.length;
        }

        for (let i = 0; i < groups.length; i += chunkSize) {
          const chunk = groups.slice(i, i + chunkSize);
          await Promise.all(
            chunk.map(g =>
              fetch(`https://graph.facebook.com/${apiVersion}/${g.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              }).catch(() => null)
            )
          );
        }

        const phoneId = process.env.META_PHONE_NUMBER_ID || '1305340429332213';
        await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/whatsapp_commerce_settings`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_catalog_visible: false, is_cart_enabled: true }),
        }).catch(() => null);

        this.logger.log(`✓ [EliminarTodos] Catálogo de Meta vaciado exitosamente (${metaEliminados} items eliminados)`);
      }
    } catch (metaErr: any) {
      this.logger.error(`[EliminarTodos] Error vaciando catálogo en Meta: ${metaErr.message}`);
    }

    await this.dataSource.query(`DELETE FROM public.variante_componente WHERE producto_variante_id IN (SELECT id_producto_variante FROM public.producto_variante WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1));`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_variante WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_atributo_componente WHERE producto_atributo_id IN (SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1));`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_atributo WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_imagen WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_lista_precio WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_retencion WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_proveedor WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_seo_ia WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.carrito_detalle WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.inventario WHERE empresa_id = $1;`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.precio WHERE empresa_id = $1;`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_referencia WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);

    const deleteRes = await this.dataSource.query(`DELETE FROM public.producto WHERE empresa_id = $1 RETURNING id_producto;`, [empresaId]);
    const totalEliminados = deleteRes.length;

    this.logger.log(`✓ [EliminarTodos] ${totalEliminados} productos eliminados de PostgreSQL`);

    return {
      ok: true,
      eliminados: totalEliminados,
      meta_eliminados: metaEliminados,
      message: `Se eliminaron ${totalEliminados} productos de la base de datos y ${metaEliminados} del catálogo de WhatsApp.`,
    };
  }

  /**
   * Carga el catálogo demo completo de Ferretería mediante script SQL nativo
   * y sincroniza automáticamente los productos y sus colecciones en Meta WhatsApp Catalog.
   */
  async seedFerreteria(empresaId = 1): Promise<{ ok: boolean; productos: number; meta_sincronizados: number; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log('[Seed] Iniciando seed integral de ferretería en PostgreSQL...');

      const possiblePaths = [
        path.resolve(process.cwd(), 'dist', 'producto', 'seeds', 'seed-ferreteria.sql'),
        path.resolve(process.cwd(), 'src', 'producto', 'seeds', 'seed-ferreteria.sql'),
        path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica/backend-chat-connect/src/producto/seeds/seed-ferreteria.sql'),
        path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica/backend-chat-connect/dist/producto/seeds/seed-ferreteria.sql'),
      ];

      let sql = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          sql = fs.readFileSync(p, 'utf8');
          this.logger.log(`[Seed] Archivo SQL cargado desde: ${p}`);
          break;
        }
      }

      if (!sql) {
        throw new Error('No se encontró el archivo seed-ferreteria.sql en ninguna de las rutas esperadas');
      }

      await queryRunner.query(sql);
      await queryRunner.commitTransaction();

      const prods = await this.dataSource.query(
        `SELECT id_producto FROM public.producto WHERE empresa_id = $1 ORDER BY id_producto ASC;`,
        [empresaId],
      );
      const prodIds = prods.map((p: any) => Number(p.id_producto));

      this.logger.log(`[Seed] Seed SQL completado exitosamente: ${prodIds.length} productos en base de datos. Iniciando sincronización con Meta WhatsApp...`);

      const syncResult = await this.metaCatalogRepo.sincronizarLoteConMetaCatalog(prodIds, empresaId);

      return {
        ok: true,
        productos: prodIds.length,
        meta_sincronizados: syncResult.exitosos,
        message: `Seed de ferretería completado: ${prodIds.length} productos cargados en PostgreSQL y sincronizados con Meta WhatsApp para mensajes interactivos (${syncResult.exitosos} sincronizados).`,
      };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Seed] Error al ejecutar seed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Error al ejecutar seed de ferretería: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
