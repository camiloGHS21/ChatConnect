import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EnviarColeccionWhatsAppDto } from '../dto/enviar-coleccion-whatsapp.dto.js';
import { MetaCatalogRepository } from './meta-catalog.repository.js';
import { ChatWhatsappRepository } from './chat-whatsapp.repository.js';

@Injectable()
export class ChatCatalogoRepository {
  private readonly logger = new Logger(ChatCatalogoRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaCatalogRepo: MetaCatalogRepository,
    private readonly chatWhatsappRepo: ChatWhatsappRepository,
  ) { }

  /**
   * Envía una colección interactiva (Multi-Product Message o Catalog Message) por WhatsApp.
   */
  async enviarColeccionWhatsApp(dto: EnviarColeccionWhatsAppDto, empresaId = 1) {
    const { metaToken, apiVersion, catalogId, phoneId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    if (!dto.telefono) {
      throw new BadRequestException('El número de WhatsApp de destino es obligatorio');
    }

    const cleanPhone = dto.telefono.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      throw new BadRequestException('Número de teléfono inválido');
    }

    try {
      let payload: any = null;
      let productosEnviadosCount = 0;
      let descripcionEnvio = '';

      if (dto.tipoMensaje === 'catalog_message') {
        let thumbId = dto.retailerIds?.[0];
        if (!thumbId) {
          const thumbRow = await this.dataSource.query(
            `SELECT codigo_interno FROM public.producto WHERE empresa_id = $1 AND fb_product_id IS NOT NULL LIMIT 1;`,
            [empresaId],
          );
          thumbId = thumbRow[0]?.codigo_interno || 'FER-0001-220-KIT';
        }

        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'catalog_message',
            body: { text: dto.cuerpo || 'Explora nuestro catálogo oficial en WhatsApp con todas las colecciones y productos disponibles:' },
            footer: { text: 'ChatConnect Ferretería' },
            action: { name: 'catalog_message', parameters: { thumbnail_product_retailer_id: thumbId } },
          },
        };
        descripcionEnvio = 'Catálogo completo de WhatsApp con todas las colecciones';
      } else if (dto.tipoMensaje === 'multi_seccion' || dto.coleccionId === 'todas_las_categorias') {
        const catProds = await this.dataSource.query(
          `SELECT c.nombre AS categoria, p.codigo_interno
           FROM public.producto p
           INNER JOIN public.categoria c ON c.id_categoria = p.categoria_id
           WHERE p.empresa_id = $1 AND p.fb_product_id IS NOT NULL AND c.estado = 'activo'
           ORDER BY c.nombre, p.id_producto;`,
          [empresaId],
        );

        const sectionsMap = new Map<string, { product_retailer_id: string }[]>();
        let totalCount = 0;
        for (const row of catProds) {
          const cat = (row.categoria || 'General').substring(0, 24);
          if (!sectionsMap.has(cat)) {
            if (sectionsMap.size >= 10) continue;
            sectionsMap.set(cat, []);
          }
          const items = sectionsMap.get(cat)!;
          if (items.length < 3 && totalCount < 30) {
            items.push({ product_retailer_id: row.codigo_interno });
            totalCount++;
          }
        }

        const sections = Array.from(sectionsMap.entries())
          .filter(([, items]) => items.length > 0)
          .map(([title, product_items]) => ({ title, product_items }));

        if (sections.length === 0) {
          throw new BadRequestException('No hay productos sincronizados con Meta para enviar por secciones');
        }

        productosEnviadosCount = totalCount;
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'product_list',
            header: { type: 'text', text: (dto.titulo || 'Catálogo de Ferretería').substring(0, 60) },
            body: { text: dto.cuerpo || 'Explora nuestras colecciones organizadas por categoría y realiza tu pedido directo:' },
            footer: { text: 'ChatConnect Ferretería' },
            action: { catalog_id: catalogId, sections },
          },
        };
        descripcionEnvio = `Catálogo Multi-Categoría (${sections.length} secciones, ${productosEnviadosCount} productos)`;
      } else {
        let productItems: { product_retailer_id: string }[] = [];

        if (dto.retailerIds && dto.retailerIds.length > 0) {
          productItems = dto.retailerIds.slice(0, 30).map((id) => ({ product_retailer_id: id }));
        } else if (dto.coleccionId) {
          const prodsRes = await fetch(
            `https://graph.facebook.com/${apiVersion}/${dto.coleccionId}/products?fields=id,retailer_id,name&limit=30`,
            { headers: { Authorization: `Bearer ${metaToken}` } },
          );
          const prodsData: any = await prodsRes.json();
          const items: any[] = prodsData?.data || [];
          productItems = items.filter((p) => p.retailer_id).slice(0, 30).map((p) => ({ product_retailer_id: p.retailer_id }));
        }

        if (productItems.length === 0) {
          const dbProds = await this.dataSource.query(
            `SELECT codigo_interno FROM public.producto
             WHERE empresa_id = $1 AND fb_product_id IS NOT NULL
             ORDER BY id_producto ASC LIMIT 10;`,
            [empresaId],
          );
          productItems = dbProds.map((p: any) => ({ product_retailer_id: p.codigo_interno }));
        }

        if (productItems.length === 0) {
          throw new BadRequestException('No hay productos aprobados en esta colección para enviar por WhatsApp');
        }

        productosEnviadosCount = productItems.length;
        const nombreCol = (dto.nombreColeccion || 'Colección de Productos').substring(0, 24);

        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'product_list',
            header: { type: 'text', text: dto.titulo || `Colección: ${dto.nombreColeccion}` },
            body: { text: dto.cuerpo || `Descubre nuestra selección de ${dto.nombreColeccion} disponibles para pedido inmediato.` },
            footer: { text: 'ChatConnect Ferretería' },
            action: { catalog_id: catalogId, sections: [{ title: nombreCol, product_items: productItems }] },
          },
        };
        descripcionEnvio = `Colección "${dto.nombreColeccion}" (${productosEnviadosCount} productos)`;
      }

      this.logger.log(`[WhatsAppMPM] Enviando colección a WhatsApp ${cleanPhone}...`);
      const sendRes = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const sendData: any = await sendRes.json();
      if (!sendRes.ok) {
        const errorMsg = sendData.error?.message || JSON.stringify(sendData);
        throw new Error(errorMsg);
      }

      const wamid = sendData.messages?.[0]?.id;
      if (typeof wamid !== 'string' || !wamid.trim()) {
        throw new BadRequestException('Meta no devolvió un identificador válido de mensaje; no se puede guardar.');
      }

      let convId = dto.conversacionId;
      if (!convId) {
        const convRows = await this.dataSource.query(
          `SELECT c.id_conversacion FROM public.conversacion c
           JOIN public.tercero t ON t.id_tercero = c.tercero_id
           WHERE c.empresa_id = $1 AND (t.whatsapp = $2 OR t.telefono = $2)
           ORDER BY c.id_conversacion DESC LIMIT 1;`,
          [empresaId, cleanPhone],
        );
        convId = convRows[0]?.id_conversacion;
      }

      if (convId) {
        await this.dataSource.query(
          `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, external_message_id, created_at)
           VALUES ($1, $2, 'outbound', 'interactive', $3, $4, $5, NOW());`,
          [
            empresaId,
            convId,
            `📦 Colección enviada por WhatsApp: ${descripcionEnvio}`,
            JSON.stringify({
              wamid,
              tipo_interactivo: dto.tipoMensaje || 'product_list',
              coleccion_id: dto.coleccionId,
              nombre_coleccion: dto.nombreColeccion,
              productos_count: productosEnviadosCount,
            }),
            wamid,
          ],
        );

        await this.dataSource.query(
          `UPDATE public.conversacion SET fecha_ultima_interaccion = NOW(), updated_at = NOW() WHERE id_conversacion = $1;`,
          [convId],
        );
      }

      return {
        ok: true,
        wamid,
        telefono: cleanPhone,
        productos_enviados: productosEnviadosCount,
        message: `Colección enviada con éxito al WhatsApp +${cleanPhone}`,
      };
    } catch (err: any) {
      this.logger.error(`[WhatsAppMPM] Error: ${err.message}`);
      throw new BadRequestException(`No se pudo enviar la colección por WhatsApp: ${err.message}`);
    }
  }

  /**
   * Envía un Producto Individual (Single Product Message - SPM) por WhatsApp.
   */
  async enviarProductoChat(conversacionId: number, dto: any, empresaId = 1) {
    const ventana = await this.chatWhatsappRepo.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException(
        'Ventana de atención de 24 horas cerrada. Solo puedes contestar cuando el cliente te haya escrito en las últimas 24 horas.',
      );
    }

    if (!dto.codigo_interno) {
      throw new BadRequestException('Debes especificar el código interno del producto');
    }

    const prodRows = await this.dataSource.query(
      `SELECT id_producto, codigo_interno, nombre, COALESCE(precio_impuesto, precio_base, 0) AS precio, fb_product_id
       FROM public.producto WHERE codigo_interno = $1 AND empresa_id = $2;`,
      [dto.codigo_interno, empresaId],
    );

    const prod = prodRows[0];
    if (!prod) throw new BadRequestException(`No se encontró el producto con código ${dto.codigo_interno}`);
    if (!prod.fb_product_id) throw new BadRequestException(`El producto "${prod.nombre}" no está sincronizado con Meta Catalog`);

    const { metaToken, apiVersion, phoneId, catalogId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const cleanPhone = (convRows[0]?.whatsapp || convRows[0]?.telefono || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) throw new BadRequestException('No se encontró número de WhatsApp para este contacto');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: {
        type: 'product',
        body: { text: dto.texto?.trim() || `Aquí tienes los detalles de ${prod.nombre}:` },
        footer: { text: 'ChatConnect Ferretería' },
        action: { catalog_id: catalogId, product_retailer_id: prod.codigo_interno },
      },
    };

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();
    if (!res.ok) throw new BadRequestException(`Error de Meta al enviar producto: ${data.error?.message || JSON.stringify(data)}`);

    const wamid = data.messages?.[0]?.id;
    if (typeof wamid !== 'string' || !wamid.trim()) {
      throw new BadRequestException('Meta no devolvió un identificador válido de mensaje; no se puede guardar.');
    }

    const insertRes = await this.dataSource.query(
      `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, external_message_id, created_at)
       VALUES ($1, $2, 'outbound', 'interactive', $3, $4, $5, NOW())
       RETURNING id_mensaje, created_at;`,
      [
        empresaId,
        conversacionId,
        `📦 Producto enviado: ${prod.nombre} (${prod.codigo_interno}) - $${Number(prod.precio).toLocaleString('es-CO')}`,
        JSON.stringify({ wamid, tipo_interactivo: 'product', producto_id: prod.id_producto, codigo_interno: prod.codigo_interno, nombre: prod.nombre }),
        wamid,
      ],
    );

    await this.dataSource.query(`UPDATE public.conversacion SET fecha_ultima_interaccion = NOW(), updated_at = NOW() WHERE id_conversacion = $1;`, [conversacionId]);

    return {
      ok: true,
      id: Number(insertRes[0]?.id_mensaje),
      wamid,
      hora: new Date(insertRes[0]?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      texto: `📦 Producto enviado: ${prod.nombre} (${prod.codigo_interno})`,
      producto: prod.nombre,
    };
  }

  /**
   * Envía productos agrupados por 1 o varias categorías (Multi-Product Message - MPM).
   */
  async enviarCategoriasChat(conversacionId: number, dto: any, empresaId = 1) {
    const ventana = await this.chatWhatsappRepo.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException('Ventana de atención de 24 horas cerrada.');
    }

    const catIds = Array.isArray(dto.categoria_ids) ? dto.categoria_ids.map(Number).filter(Boolean) : [];
    if (catIds.length === 0) throw new BadRequestException('Debes seleccionar al menos una categoría');

    const placeholders = catIds.map((_id: number, i: number) => `$${i + 2}`).join(',');
    const prodRows = await this.dataSource.query(
      `SELECT c.id_categoria, c.nombre AS categoria, p.id_producto, p.codigo_interno, p.nombre AS producto
       FROM public.producto p
       INNER JOIN public.categoria c ON c.id_categoria = p.categoria_id
       WHERE p.empresa_id = $1 AND p.fb_product_id IS NOT NULL AND c.id_categoria IN (${placeholders})
       ORDER BY c.nombre, p.id_producto ASC;`,
      [empresaId, ...catIds],
    );

    if (prodRows.length === 0) throw new BadRequestException('Las categorías seleccionadas no tienen productos aprobados en Meta');

    const sectionsMap = new Map<string, { product_retailer_id: string }[]>();
    let totalItems = 0;
    for (const r of prodRows) {
      const catTitle = (r.categoria || 'Productos').substring(0, 24);
      if (!sectionsMap.has(catTitle)) {
        if (sectionsMap.size >= 10) continue;
        sectionsMap.set(catTitle, []);
      }
      const items = sectionsMap.get(catTitle)!;
      if (items.length < 10 && totalItems < 30) {
        items.push({ product_retailer_id: r.codigo_interno });
        totalItems++;
      }
    }

    const sections = Array.from(sectionsMap.entries())
      .filter(([, items]) => items.length > 0)
      .map(([title, product_items]) => ({ title, product_items }));

    const { metaToken, apiVersion, phoneId, catalogId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const cleanPhone = (convRows[0]?.whatsapp || convRows[0]?.telefono || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) throw new BadRequestException('No se encontró número de WhatsApp para este contacto');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: {
        type: 'product_list',
        header: { type: 'text', text: (dto.titulo?.trim() || 'Catálogo de Productos').substring(0, 60) },
        body: { text: dto.texto?.trim() || 'Consulta los artículos disponibles en las siguientes categorías:' },
        footer: { text: 'ChatConnect Ferretería' },
        action: { catalog_id: catalogId, sections },
      },
    };

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();
    if (!res.ok) throw new BadRequestException(`Error de Meta al enviar catálogo: ${data.error?.message || JSON.stringify(data)}`);

    const wamid = data.messages?.[0]?.id;
    if (typeof wamid !== 'string' || !wamid.trim()) {
      throw new BadRequestException('Meta no devolvió un identificador válido de mensaje; no se puede guardar.');
    }
    const catNombres = Array.from(sectionsMap.keys()).join(', ');

    const insertRes = await this.dataSource.query(
      `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, external_message_id, created_at)
       VALUES ($1, $2, 'outbound', 'interactive', $3, $4, $5, NOW())
       RETURNING id_mensaje, created_at;`,
      [
        empresaId,
        conversacionId,
        `📦 Catálogo enviado (${sections.length} categorías: ${catNombres} - ${totalItems} productos)`,
        JSON.stringify({ wamid, tipo_interactivo: 'product_list', secciones: sections.length, categorias: catNombres, total_productos: totalItems }),
        wamid,
      ],
    );

    await this.dataSource.query(`UPDATE public.conversacion SET fecha_ultima_interaccion = NOW(), updated_at = NOW() WHERE id_conversacion = $1;`, [conversacionId]);

    return {
      ok: true,
      id: Number(insertRes[0]?.id_mensaje),
      wamid,
      hora: new Date(insertRes[0]?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      texto: `📦 Catálogo enviado (${sections.length} categorías: ${catNombres} - ${totalItems} productos)`,
      categorias_enviadas: sections.length,
      productos_enviados: totalItems,
    };
  }

  /**
   * Envía automáticamente el catálogo multi-categoría dividido en secciones a la conversación.
   */
  async enviarCatalogoMultiCategoria(conversacionId: number, empresaId = 1) {
    const ventana = await this.chatWhatsappRepo.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException('Ventana de atención de 24 horas cerrada.');
    }

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const phone = convRows[0]?.whatsapp || convRows[0]?.telefono;
    if (!phone) throw new BadRequestException('No se encontró número de WhatsApp para este contacto');

    return await this.enviarColeccionWhatsApp(
      {
        telefono: phone,
        nombreColeccion: 'Catálogo por Categorías',
        tipoMensaje: 'multi_seccion',
        titulo: 'Catálogo de Productos',
        cuerpo: 'Explora nuestras colecciones organizadas por categoría y realiza tu pedido directo:',
        conversacionId,
        empresa_id: empresaId,
      },
      empresaId,
    );
  }
}
