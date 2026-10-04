import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MetaSyncRepository } from './meta-sync.repository.js';

@Injectable()
export class MetaCatalogRepository {
  private readonly logger = new Logger(MetaCatalogRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaSyncRepo: MetaSyncRepository,
  ) { }

  /**
   * Obtiene la configuración de Meta Cloud API y el Catálogo para la empresa.
   */
  async getMetaCatalogContext(empresaId = 1) {
    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = process.env.META_BUSINESS_ID;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    const canalRows = await this.dataSource.query(
      `SELECT id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion
       FROM public.canal
       WHERE empresa_id = $1 AND tipo = 'whatsapp'
       ORDER BY id_canal ASC
       LIMIT 1;`,
      [empresaId],
    );

    const canal = canalRows[0];
    const catalogId = canal?.catalog_id || process.env.META_CATALOG_ID || '912267985057130';
    const phoneId = canal?.phone_number_id || canal?.configuracion?.phone_number_id || process.env.META_PHONE_NUMBER_ID || '1305340429332213';
    const wabaId = canal?.waba_id || canal?.configuracion?.waba_id || process.env.META_WABA_ID;

    return {
      metaToken,
      businessId,
      apiVersion,
      catalogId,
      phoneId,
      wabaId,
      canal,
    };
  }

  /**
   * Activa inmediatamente el comercio y carrito de WhatsApp para refrescar la caché del dispositivo
   */
  async activarComercioWhatsApp(
    phoneId: string,
    catalogId: string,
    metaToken: string,
    apiVersion: string,
    wabaId?: string,
  ) {
    if (!phoneId || !catalogId) return;
    try {
      if (wabaId) {
        await fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/product_catalogs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ catalog_id: catalogId }),
        }).catch(() => null);
      }

      const res = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneId}/whatsapp_commerce_settings`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_cart_enabled: true, is_catalog_visible: false }),
        },
      );
      const data: any = await res.json();
      if (data?.success) {
        this.logger.log(`✓ [MetaCatalog] WhatsApp Commerce configurado con éxito`);
      }
    } catch (err: any) {
      this.logger.warn(`[MetaCatalog] Advertencia activando WhatsApp Commerce: ${err.message}`);
    }
  }

  /**
   * Garantiza que las colecciones (Product Sets) aparezcan en WhatsApp de forma estructurada y jerárquica.
   */
  async asegurarProductSets(
    catalogId: string,
    catNombre: string,
    subcatNombre: string,
    metaToken: string,
    apiVersion: string,
  ) {
    if (!catalogId || (!catNombre && !subcatNombre)) return;
    try {
      const setsRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name,filter`,
        { headers: { Authorization: `Bearer ${metaToken}` } },
      );
      const setsData: any = await setsRes.json();
      const existingSets: any[] = setsData?.data || [];

      if (catNombre) {
        const catSet = existingSets.find(
          (s: any) => s.name?.toLowerCase().trim() === catNombre.toLowerCase().trim(),
        );
        if (!catSet) {
          await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: catNombre,
              filter: { product_type: { contains: catNombre } },
            }),
          }).catch(() => null);
        }
      }

      if (subcatNombre) {
        const subcatSetName = catNombre ? `${catNombre} - ${subcatNombre}` : subcatNombre;
        const exactSubSet = existingSets.find(
          (s: any) => s.name?.toLowerCase().trim() === subcatSetName.toLowerCase().trim(),
        );
        if (!exactSubSet) {
          await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: subcatSetName,
              filter: { category: { eq: subcatNombre } },
            }),
          }).catch(() => null);
        }
      }
    } catch (setErr: any) {
      this.logger.warn(`[MetaCatalog] Advertencia gestionando colecciones jerárquicas: ${setErr.message}`);
    }
  }

  /**
   * Sincroniza un lote de productos con Meta Catalog y asegura todas las colecciones.
   */
  async sincronizarLoteConMetaCatalog(
    productoIds: number[],
    empresaId = 1,
  ): Promise<{ exitosos: number; fallidos: number; total: number }> {
    const { metaToken, businessId, apiVersion, catalogId, phoneId, wabaId } = await this.getMetaCatalogContext(empresaId);

    if (!metaToken || !businessId) {
      this.logger.warn(`[MetaCatalogBatch] Token de Meta o Business ID no configurados`);
      return { exitosos: 0, fallidos: productoIds.length, total: productoIds.length };
    }

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
    const existingByRetailer = new Map<string, string>();
    for (const it of (pData?.data || [])) {
      if (it.retailer_id) existingByRetailer.set(it.retailer_id, it.id);
    }
    const existingGroupByRetailer = new Map<string, string>();
    for (const g of (gData?.data || [])) {
      if (g.retailer_id) existingGroupByRetailer.set(g.retailer_id, g.id);
    }

    const cachedContext = {
      metaToken,
      businessId,
      apiVersion,
      catalogId,
      wabaId,
      phoneId,
      existingByRetailer,
      existingGroupByRetailer,
      skipPostOperations: true,
    };

    let exitosos = 0;
    let fallidos = 0;
    const concurrency = 5;

    for (let i = 0; i < productoIds.length; i += concurrency) {
      const chunk = productoIds.slice(i, i + concurrency);
      const results = await Promise.all(
        chunk.map(id => this.metaSyncRepo.sincronizarConMetaCatalog(id, empresaId, cachedContext).catch(() => null)),
      );
      for (const r of results) {
        if (r && r.success) exitosos++;
        else fallidos++;
      }
    }

    if (wabaId && catalogId) {
      await fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/product_catalogs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog_id: catalogId }),
      }).catch(() => null);
    }

    if (phoneId && catalogId) {
      await this.activarComercioWhatsApp(phoneId, catalogId, metaToken, apiVersion, wabaId);
    }

    return { exitosos, fallidos, total: productoIds.length };
  }

  async sincronizarConMetaCatalog(productoId: number, empresaId = 1, cachedContext?: any) {
    return this.metaSyncRepo.sincronizarConMetaCatalog(productoId, empresaId, cachedContext);
  }

  async sincronizarDiferencialMeta(newProd: any, empresaId = 1) {
    return this.metaSyncRepo.sincronizarDiferencialMeta(newProd, empresaId);
  }
}
