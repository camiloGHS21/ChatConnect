import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateColeccionDto } from '../dto/create-coleccion.dto.js';
import { MetaCatalogRepository } from './meta-catalog.repository.js';

@Injectable()
export class MetaColeccionRepository {
  private readonly logger = new Logger(MetaColeccionRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaCatalogRepo: MetaCatalogRepository,
  ) { }

  /**
   * Lista todas las colecciones (Product Sets) configuradas en Meta Commerce Catalog para WhatsApp.
   */
  async getColeccionesMeta(empresaId = 1) {
    const { metaToken, apiVersion, catalogId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    if (!metaToken || !catalogId) {
      throw new BadRequestException('Meta Cloud API o Catálogo no configurado en el servidor');
    }

    try {
      this.logger.log(`[MetaCollections] Consultando colecciones (Product Sets) en Meta Catalog ${catalogId}...`);
      const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name,filter,product_count&limit=100`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${metaToken}` },
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al consultar Product Sets en Meta');
      }

      const sets: any[] = data.data || [];

      const catRows = await this.dataSource.query(
        `SELECT id_categoria, nombre FROM public.categoria WHERE empresa_id = $1 AND estado = 'activo';`,
        [empresaId],
      );
      const catNames = new Set(catRows.map((c: any) => c.nombre.toLowerCase().trim()));

      const enrichedSets = sets.map((s) => {
        let filterObj: any = null;
        try {
          filterObj = typeof s.filter === 'string' ? JSON.parse(s.filter) : s.filter;
        } catch {
          filterObj = s.filter;
        }

        let tipo = 'personalizada';
        const nameLower = (s.name || '').toLowerCase().trim();
        if (s.name === 'All Products') {
          tipo = 'catalogo_completo';
        } else if (catNames.has(nameLower)) {
          tipo = 'categoria';
        } else if (s.name.includes(' - ') || s.name.includes(' › ')) {
          tipo = 'subcategoria';
        }

        return {
          id: s.id,
          name: s.name,
          product_count: s.product_count ?? 0,
          filter: filterObj,
          tipo,
          catalog_id: catalogId,
        };
      });

      return {
        catalog_id: catalogId,
        total: enrichedSets.length,
        colecciones: enrichedSets,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error consultando colecciones: ${err.message}`);
      throw new InternalServerErrorException(`Error al consultar colecciones en Meta: ${err.message}`);
    }
  }

  /**
   * Obtiene los productos pertenecientes a una colección específica en Meta.
   */
  async getProductosDeColeccionMeta(productSetId: string, empresaId = 1) {
    const { metaToken, apiVersion } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    if (!metaToken || !productSetId) {
      throw new BadRequestException('Parámetros de consulta de colección inválidos');
    }

    try {
      this.logger.log(`[MetaCollections] Obteniendo productos del Product Set ${productSetId}...`);
      const url = `https://graph.facebook.com/${apiVersion}/${productSetId}/products?fields=id,retailer_id,name,price,image_url,description,availability&limit=50`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${metaToken}` },
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al obtener productos de la colección en Meta');
      }

      const rawProducts: any[] = data.data || [];
      const retailerIds = rawProducts.map((p) => p.retailer_id).filter(Boolean);
      let localProdsMap = new Map<string, any>();

      if (retailerIds.length > 0) {
        const placeholders = retailerIds.map((_, i) => `$${i + 2}`).join(',');
        const localRows = await this.dataSource.query(
          `SELECT p.id_producto, p.codigo_interno, p.nombre, p.precio_impuesto,
                  GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible
           FROM public.producto p
           LEFT JOIN (
             SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
             FROM public.inventario WHERE empresa_id = $1 GROUP BY producto_id
           ) inv ON inv.producto_id = p.id_producto
           WHERE p.empresa_id = $1 AND (
             p.codigo_interno IN (${placeholders}) OR
             EXISTS (
               SELECT 1 FROM public.producto_referencia pr
               WHERE pr.producto_id = p.id_producto AND pr.referencia IN (${placeholders})
             )
           );`,
          [empresaId, ...retailerIds],
        );

        for (const lp of localRows) {
          if (lp.codigo_interno) localProdsMap.set(lp.codigo_interno, lp);
        }
      }

      const productosEnriquecidos = rawProducts.map((p) => {
        const local = localProdsMap.get(p.retailer_id);
        return {
          id: p.id,
          retailer_id: p.retailer_id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          description: p.description,
          availability: p.availability,
          stock_local: local ? local.disponible : null,
          id_producto_local: local ? local.id_producto : null,
        };
      });

      return {
        product_set_id: productSetId,
        total: productosEnriquecidos.length,
        productos: productosEnriquecidos,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error obteniendo productos de colección: ${err.message}`);
      throw new InternalServerErrorException(`Error al obtener productos de la colección: ${err.message}`);
    }
  }

  /**
   * Crea una nueva colección (Product Set) en Meta Commerce Catalog.
   */
  async crearColeccionMeta(dto: CreateColeccionDto, empresaId = 1) {
    const { metaToken, apiVersion, catalogId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('El nombre de la colección es obligatorio');
    }

    let filter: any = {};
    if (dto.tipo === 'categoria' && dto.categoriaNombre) {
      filter = { product_type: { contains: dto.categoriaNombre.trim() } };
    } else if (dto.tipo === 'subcategoria' && dto.subcategoriaNombre) {
      filter = { category: { eq: dto.subcategoriaNombre.trim() } };
    } else if (dto.tipo === 'productos_seleccionados' && dto.retailerIds && dto.retailerIds.length > 0) {
      filter = { retailer_id: { is_any: dto.retailerIds } };
    } else {
      filter = { product_type: { contains: dto.name.trim() } };
    }

    try {
      this.logger.log(`[MetaCollections] Creando colección "${dto.name}" en Meta Catalog ${catalogId}...`);
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dto.name.trim(), filter }),
      });

      const data: any = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error?.message || 'Error al crear Product Set en Meta');
      }

      this.logger.log(`✓ [MetaCollections] Colección creada en Meta con ID: ${data.id}`);

      return {
        ok: true,
        id: data.id,
        name: dto.name.trim(),
        filter,
        message: `Colección "${dto.name}" creada exitosamente en Meta Commerce y WhatsApp`,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error al crear colección: ${err.message}`);
      throw new BadRequestException(`No se pudo crear la colección en Meta: ${err.message}`);
    }
  }

  /**
   * Elimina una colección (Product Set) de Meta Commerce Catalog.
   */
  async eliminarColeccionMeta(productSetId: string, empresaId = 1) {
    const { metaToken, apiVersion } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    try {
      this.logger.log(`[MetaCollections] Eliminando Product Set ${productSetId} en Meta...`);
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${productSetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${metaToken}` },
      });

      const data: any = await res.json();
      if (!res.ok || data.success !== true) {
        throw new Error(data.error?.message || 'Error al eliminar Product Set en Meta');
      }

      this.logger.log(`✓ [MetaCollections] Colección ${productSetId} eliminada en Meta`);

      return {
        ok: true,
        id: productSetId,
        message: 'Colección eliminada exitosamente del catálogo de WhatsApp',
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error al eliminar colección: ${err.message}`);
      throw new BadRequestException(`Error al eliminar la colección en Meta: ${err.message}`);
    }
  }

  /**
   * Sincroniza y asegura todas las colecciones basadas en las categorías y subcategorías activas.
   */
  async sincronizarColeccionesMeta(empresaId = 1) {
    const { metaToken, apiVersion, catalogId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    try {
      this.logger.log(`[MetaCollections] Sincronizando colecciones jerárquicas con Meta...`);

      const catSubRows = await this.dataSource.query(
        `SELECT DISTINCT c.nombre AS categoria, sc.nombre AS subcategoria
         FROM public.categoria c
         LEFT JOIN public.subcategoria sc ON sc.categoria_id = c.id_categoria AND sc.empresa_id = c.empresa_id AND sc.estado = 'activo'
         WHERE c.empresa_id = $1 AND c.estado = 'activo'
         ORDER BY c.nombre, sc.nombre;`,
        [empresaId],
      );

      const setsRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name,filter&limit=200`,
        { headers: { Authorization: `Bearer ${metaToken}` } },
      );
      const setsData: any = await setsRes.json();
      const existingSets: any[] = setsData?.data || [];
      const setNamesLower = new Set(existingSets.map((s: any) => (s.name || '').toLowerCase().trim()));

      let creadas = 0;
      const categoriesDone = new Set<string>();

      for (const row of catSubRows) {
        const catName = (row.categoria || '').trim();
        const subcatName = (row.subcategoria || '').trim();

        if (catName && !categoriesDone.has(catName.toLowerCase())) {
          categoriesDone.add(catName.toLowerCase());
          if (!setNamesLower.has(catName.toLowerCase())) {
            const createRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: catName,
                filter: { product_type: { contains: catName } },
              }),
            });
            const cData: any = await createRes.json();
            if (cData?.id) {
              setNamesLower.add(catName.toLowerCase());
              creadas++;
            }
          }
        }

        if (subcatName) {
          const subSetName = catName ? `${catName} - ${subcatName}` : subcatName;
          if (!setNamesLower.has(subSetName.toLowerCase())) {
            const scRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: subSetName,
                filter: { category: { eq: subcatName } },
              }),
            });
            const scData: any = await scRes.json();
            if (scData?.id) {
              setNamesLower.add(subSetName.toLowerCase());
              creadas++;
            }
          }
        }
      }

      return {
        ok: true,
        creadas,
        total_existentes: existingSets.length + creadas,
        message: `Sincronización de colecciones finalizada: ${creadas} nuevas creadas, ${existingSets.length + creadas} activas en WhatsApp.`,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error en sincronización masiva: ${err.message}`);
      throw new InternalServerErrorException(`Error al sincronizar colecciones: ${err.message}`);
    }
  }
}
