import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  sanitizeMetaText,
  buildMetaDescription,
  buildVariantDimensions,
  extractVariantComponents,
  matchVariantImage,
} from './meta-catalog.helper.js';

@Injectable()
export class MetaSyncRepository {
  private readonly logger = new Logger(MetaSyncRepository.name);

  constructor(private readonly dataSource: DataSource) { }

  /**
   * Sincroniza un producto individual (con o sin variantes) en Meta Commerce Catalog.
   */
  async sincronizarConMetaCatalog(
    productoId: number,
    empresaId = 1,
    cachedContext?: {
      metaToken?: string;
      businessId?: string;
      apiVersion?: string;
      catalogId?: string;
      wabaId?: string;
      phoneId?: string;
      existingByRetailer?: Map<string, string>;
      existingGroupByRetailer?: Map<string, string>;
      skipPostOperations?: boolean;
    },
  ) {
    const metaToken =
      cachedContext?.metaToken ||
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = cachedContext?.businessId || process.env.META_BUSINESS_ID;
    const apiVersion = cachedContext?.apiVersion || process.env.META_API_VERSION || 'v21.0';

    if (!metaToken || !businessId) {
      await this.dataSource.query(
        `UPDATE public.producto
         SET meta_sync_status = 'pendiente',
             meta_sync_error = 'Meta Cloud API no configurada: defina META_BUSINESS_ID y META_PERMANENT_TOKEN en .env'
         WHERE id_producto = $1;`,
        [productoId],
      );
      this.logger.warn(`[MetaCatalog] META_BUSINESS_ID o META_PERMANENT_TOKEN no configurados en .env`);
      return { success: false, reason: 'unconfigured_env' };
    }

    try {
      let catalogId = cachedContext?.catalogId;
      let wabaId = cachedContext?.wabaId;
      let phoneId = cachedContext?.phoneId;

      if (!catalogId) {
        const canalRows = await this.dataSource.query(
          `SELECT id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion
           FROM public.canal
           WHERE empresa_id = $1 AND tipo = 'whatsapp'
           ORDER BY id_canal ASC
           LIMIT 1;`,
          [empresaId],
        );
        let canal = canalRows[0];
        if (!canal) {
          const empRows = await this.dataSource.query(
            `SELECT nombre_comercial, whatsapp FROM public.empresa WHERE id_empresa = $1 LIMIT 1;`,
            [empresaId],
          );
          const emp = empRows[0];
          const newCanal = await this.dataSource.query(
            `INSERT INTO public.canal (empresa_id, tipo, proveedor, phone_number, estado, configuracion)
             VALUES ($1, 'whatsapp', 'meta', $2, 'activo', '{}')
             RETURNING id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion;`,
            [empresaId, emp?.whatsapp || null],
          );
          canal = newCanal[0];
        }

        catalogId = canal.catalog_id;
        if (!catalogId) {
          const empRows = await this.dataSource.query(
            `SELECT nombre_comercial FROM public.empresa WHERE id_empresa = $1 LIMIT 1;`,
            [empresaId],
          );
          const catalogName = `Catálogo - ${empRows[0]?.nombre_comercial || `Empresa ${empresaId}`}`;
          const catRes = await fetch(`https://graph.facebook.com/${apiVersion}/${businessId}/owned_product_catalogs`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: catalogName }),
          });
          const catData: any = await catRes.json();
          if (!catRes.ok || !catData.id) {
            const errMsg = catData.error?.message || JSON.stringify(catData);
            await this.dataSource.query(
              `UPDATE public.producto SET meta_sync_status = 'error', meta_sync_error = $1 WHERE id_producto = $2;`,
              [`Error al crear catálogo en Meta: ${errMsg}`, productoId],
            );
            return { success: false, error: errMsg };
          }
          catalogId = catData.id;
          await this.dataSource.query(`UPDATE public.canal SET catalog_id = $1, updated_at = NOW() WHERE id_canal = $2;`, [catalogId, canal.id_canal]);
        }
        wabaId = canal.waba_id || canal.configuracion?.waba_id || process.env.META_WABA_ID;
        phoneId = canal.phone_number_id || canal.configuracion?.phone_number_id || process.env.META_PHONE_NUMBER_ID;
      }

      // Obtener datos del producto
      const prodRows = await this.dataSource.query(
        `SELECT
           p.id_producto, p.codigo_interno, p.nombre, p.descripcion_corta, p.descripcion_larga,
           p.ficha_tecnica, p.costo_base, p.precio_base, p.precio_impuesto, p.fb_product_id,
           COALESCE(m.nombre, '') AS marca_nombre,
           COALESCE(c.nombre, '') AS categoria_nombre,
           COALESCE(sc.nombre, '') AS subcategoria_nombre,
           img.url AS imagen_url,
           img.nombre AS imagen_nombre,
           GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
           COALESCE(
             (SELECT pr.referencia FROM public.producto_referencia pr WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo' ORDER BY pr.id_producto_referencia ASC LIMIT 1),
             p.codigo_interno
           ) AS referencia_principal
         FROM public.producto p
         LEFT JOIN public.marca m ON m.id_marca = p.marca_id
         LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
         LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
         LEFT JOIN LATERAL (
           SELECT url, nombre FROM public.producto_imagen
           WHERE producto_id = p.id_producto AND estado = 'activo'
           ORDER BY principal DESC, orden ASC, id_producto_imagen ASC
           LIMIT 1
         ) img ON true
         LEFT JOIN (
           SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
           FROM public.inventario WHERE empresa_id = $1 GROUP BY producto_id
         ) inv ON inv.producto_id = p.id_producto
         WHERE p.id_producto = $2 AND p.empresa_id = $1
         LIMIT 1;`,
        [empresaId, productoId],
      );

      const prod = prodRows[0];
      if (!prod) return { success: false, reason: 'not_found' };

      // Consultar atributos
      const attrRows = await this.dataSource.query(
        `SELECT DISTINCT
           TRIM(a.nombre) AS attr_nombre,
           LOWER(TRIM(a.codigo)) AS attr_codigo,
           TRIM(ac.nombre) AS comp_nombre
         FROM public.producto_atributo pa
         JOIN public.atributo a ON a.id_atributo = pa.atributo_id
         LEFT JOIN public.producto_atributo_componente pac ON pac.producto_atributo_id = pa.id_producto_atributo AND pac.estado = 'activo'
         LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = pac.atributo_componente_id
         WHERE pa.producto_id = $1 AND pa.estado = 'activo'
         ORDER BY attr_nombre;`,
        [productoId],
      );

      const attrsMap = new Map<string, { nombre: string; opciones: Set<string> }>();
      for (const row of attrRows) {
        const key = row.attr_codigo || row.attr_nombre.toLowerCase();
        if (!attrsMap.has(key)) {
          attrsMap.set(key, { nombre: row.attr_nombre, opciones: new Set() });
        }
        if (row.comp_nombre) {
          attrsMap.get(key)!.opciones.add(row.comp_nombre);
        }
      }

      // Variantes
      const varRows = await this.dataSource.query(
        `SELECT
           v.id_producto_variante, v.sku, v.codigo_barras, v.referencia, v.precio, v.estado,
           COALESCE(
             JSON_AGG(
               JSON_BUILD_OBJECT('attr_nombre', a.nombre, 'attr_codigo', a.codigo, 'comp_nombre', ac.nombre)
             ) FILTER (WHERE ac.id_atributo_componente IS NOT NULL),
             '[]'::json
           ) AS componentes
         FROM public.producto_variante v
         LEFT JOIN public.variante_componente vc ON vc.producto_variante_id = v.id_producto_variante
         LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = vc.atributo_componente_id
         LEFT JOIN public.atributo a ON a.id_atributo = ac.atributo_id
         WHERE v.producto_id = $1 AND v.estado = 'activo'
         GROUP BY v.id_producto_variante, v.sku, v.codigo_barras, v.referencia, v.precio, v.estado
         ORDER BY v.id_producto_variante ASC;`,
        [productoId],
      );

      const precioFinalDeVenta = Number(prod.precio_impuesto || prod.precio_base) || 0;
      const priceInCents = Math.round(precioFinalDeVenta * 100);
      const catNombre = sanitizeMetaText(prod.categoria_nombre);
      const subcatNombre = sanitizeMetaText(prod.subcategoria_nombre);
      const refPrincipal = (prod.referencia_principal || prod.codigo_interno || `PROD-${prod.id_producto}`).trim();
      const itemGroupId = prod.codigo_interno || `PROD-${prod.id_producto}`;
      const imageUrl = prod.imagen_url || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80';

      let existingByRetailer = cachedContext?.existingByRetailer;
      let existingGroupByRetailer = cachedContext?.existingGroupByRetailer;

      if (!existingByRetailer || !existingGroupByRetailer) {
        const [metaProdsRes, metaGroupsRes] = await Promise.all([
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=1000&fields=id,retailer_id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups?limit=1000&fields=id,retailer_id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
        ]);
        const pData: any = await metaProdsRes.json();
        const gData: any = await metaGroupsRes.json();
        existingByRetailer = new Map();
        for (const it of (pData?.data || [])) {
          if (it.retailer_id) existingByRetailer.set(it.retailer_id, it.id);
        }
        existingGroupByRetailer = new Map();
        for (const g of (gData?.data || [])) {
          if (g.retailer_id) existingGroupByRetailer.set(g.retailer_id, g.id);
        }
      }

      let fbProductId: string | null = null;

      // A. Producto con Variantes
      if (varRows && varRows.length > 0) {
        let productGroupId = existingGroupByRetailer.get(itemGroupId) || null;
        if (!productGroupId) {
          const variantDimensions = buildVariantDimensions(attrsMap, varRows);
          try {
            const createGroupRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ retailer_id: itemGroupId, variants: variantDimensions }),
            });
            const gRes: any = await createGroupRes.json();
            if (gRes?.id) productGroupId = gRes.id;
          } catch (gErr: any) {
            this.logger.warn(`[MetaCatalog] Error creando ProductGroup: ${gErr.message}`);
          }
        }

        const prodImages = await this.dataSource.query(
          `SELECT id_producto_imagen AS id, url, nombre, principal, orden
           FROM public.producto_imagen WHERE producto_id = $1 AND estado = 'activo'
           ORDER BY principal DESC, orden ASC;`,
          [productoId],
        );

        for (const v of varRows) {
          const vRetailerId = (v.sku || v.referencia || `${refPrincipal}-VAR-${v.id_producto_variante}`).trim();
          const { color, size, material, pattern, additionalAttrs, specsDetails } = extractVariantComponents(v.componentes);
          const vImageUrl = matchVariantImage(color, prodImages, imageUrl);
          const vPrecio = Number(v.precio || precioFinalDeVenta);
          const vPriceInCents = Math.round(vPrecio * 100);

          const vBreadcrumbs: string[] = [];
          if (catNombre) vBreadcrumbs.push(`📁 Categoría: ${catNombre}`);
          if (subcatNombre) vBreadcrumbs.push(`📂 Subcategoría: ${subcatNombre}`);
          if (vRetailerId) vBreadcrumbs.push(`🔖 Referencia: ${vRetailerId}`);
          if (prod.marca_nombre) vBreadcrumbs.push(`🏷️ Marca: ${prod.marca_nombre}`);
          if (specsDetails.length > 0) vBreadcrumbs.push(...specsDetails);

          const vFullDesc = [
            sanitizeMetaText(prod.descripcion_corta || prod.nombre),
            vBreadcrumbs.join(' | '),
            prod.ficha_tecnica ? `\n📋 Ficha Técnica:\n${sanitizeMetaText(prod.ficha_tecnica)}` : '',
          ].filter(Boolean).join('\n\n').substring(0, 5000);

          const varPayload: any = {
            retailer_id: vRetailerId,
            name: sanitizeMetaText(`${prod.nombre} ${v.sku ? `(${v.sku})` : ''}`, true),
            description: vFullDesc,
            availability: prod.disponible > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            price: vPriceInCents,
            currency: 'COP',
            image_url: vImageUrl,
            brand: sanitizeMetaText(prod.marca_nombre || 'Genérica', true),
            product_type: catNombre || 'General',
            category: subcatNombre || catNombre || 'General',
            custom_label_0: catNombre || 'General',
            custom_label_1: subcatNombre || '',
            custom_label_2: vRetailerId,
            item_group_id: itemGroupId,
          };

          if (color) varPayload.color = color;
          if (size) varPayload.size = size;
          if (material) varPayload.material = material;
          if (pattern) varPayload.pattern = pattern;
          if (Object.keys(additionalAttrs).length > 0) varPayload.additional_variant_attributes = additionalAttrs;

          const existingVarId = existingByRetailer.get(vRetailerId);
          const vUrl = existingVarId
            ? `https://graph.facebook.com/${apiVersion}/${existingVarId}`
            : `https://graph.facebook.com/${apiVersion}/${catalogId}/products`;

          const vRes = await fetch(vUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(varPayload),
          });
          const vData: any = await vRes.json();
          if (vData?.id && !fbProductId) fbProductId = vData.id;
        }
      } else {
        // B. Producto Simple
        const retailerId = refPrincipal;
        const simpleBreadcrumbs: string[] = [];
        if (catNombre) simpleBreadcrumbs.push(`📁 Categoría: ${catNombre}`);
        if (subcatNombre) simpleBreadcrumbs.push(`📂 Subcategoría: ${subcatNombre}`);
        if (retailerId) simpleBreadcrumbs.push(`🔖 Referencia: ${retailerId}`);
        if (prod.marca_nombre) simpleBreadcrumbs.push(`🏷️ Marca: ${prod.marca_nombre}`);

        const simpleDesc = [
          sanitizeMetaText(prod.descripcion_corta || prod.nombre),
          simpleBreadcrumbs.join(' | '),
          prod.ficha_tecnica ? `\n📋 Ficha Técnica:\n${sanitizeMetaText(prod.ficha_tecnica)}` : '',
        ].filter(Boolean).join('\n\n').substring(0, 5000);

        const singlePayload: any = {
          retailer_id: retailerId,
          name: sanitizeMetaText(prod.nombre, true),
          description: simpleDesc,
          availability: prod.disponible > 0 ? 'in stock' : 'out of stock',
          condition: 'new',
          price: priceInCents,
          currency: 'COP',
          image_url: imageUrl,
          brand: sanitizeMetaText(prod.marca_nombre || 'Genérica', true),
          product_type: catNombre || 'General',
          category: subcatNombre || catNombre || 'General',
          custom_label_0: catNombre || 'General',
          custom_label_1: subcatNombre || '',
          custom_label_2: retailerId,
        };

        const existingSingleId = existingByRetailer.get(retailerId) || prod.fb_product_id;
        const sUrl = existingSingleId
          ? `https://graph.facebook.com/${apiVersion}/${existingSingleId}`
          : `https://graph.facebook.com/${apiVersion}/${catalogId}/products`;

        const sRes = await fetch(sUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(singlePayload),
        });
        const sData: any = await sRes.json();
        if (sData?.id) fbProductId = sData.id;
      }

      // Actualizar trazabilidad en PostgreSQL
      await this.dataSource.query(
        `UPDATE public.producto
         SET fb_product_id = COALESCE($1, fb_product_id),
             meta_sync_status = 'sincronizado',
             meta_sync_error = NULL,
             meta_synced_at = NOW()
         WHERE id_producto = $2;`,
        [fbProductId, productoId],
      );

      return { success: true, fb_product_id: fbProductId, catalog_id: catalogId };
    } catch (err: any) {
      this.logger.error(`[MetaCatalog] Error en sincronizarConMetaCatalog: ${err.message}`);
      await this.dataSource.query(
        `UPDATE public.producto SET meta_sync_status = 'error', meta_sync_error = $1 WHERE id_producto = $2;`,
        [err.message, productoId],
      );
      return { success: false, error: err.message };
    }
  }

  /**
   * Sincronización diferencial en Meta: actualiza únicamente los campos modificados.
   */
  async sincronizarDiferencialMeta(newProd: any, empresaId = 1) {
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
      const catalogId = canalRows[0]?.catalog_id;
      if (!metaToken || !catalogId) return;

      const metaProdsRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?fields=id,retailer_id,name,price,availability`, {
        headers: { Authorization: `Bearer ${metaToken}` },
      });
      const pData: any = await metaProdsRes.json();
      const metaItems: any[] = pData?.data || [];
      const metaByRetailer = new Map<string, any>();
      for (const it of metaItems) {
        if (it.retailer_id) metaByRetailer.set(it.retailer_id, it);
      }

      const retailerId = (newProd.referencia_principal || newProd.codigo_interno || `PROD-${newProd.id_producto}`).trim();
      const existingMeta = metaByRetailer.get(retailerId);
      if (existingMeta) {
        const precio = Number(newProd.precio_impuesto || newProd.precio_base) || 0;
        await fetch(`https://graph.facebook.com/${apiVersion}/${existingMeta.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: sanitizeMetaText(newProd.nombre, true),
            price: Math.round(precio * 100),
            currency: 'COP',
            availability: (newProd.disponible || 0) > 0 ? 'in stock' : 'out of stock',
          }),
        });
      }
    } catch (err: any) {
      this.logger.warn(`[MetaCatalog] Advertencia en sync diferencial: ${err.message}`);
    }
  }
}
