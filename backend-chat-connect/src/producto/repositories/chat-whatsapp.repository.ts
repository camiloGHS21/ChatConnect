import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MetaCatalogRepository } from './meta-catalog.repository.js';

@Injectable()
export class ChatWhatsappRepository {
  private readonly logger = new Logger(ChatWhatsappRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly metaCatalogRepo: MetaCatalogRepository,
  ) { }

  /**
   * Valida si la ventana de atención de servicio de 24 horas de WhatsApp está activa.
   */
  async verificarVentanaServicio24h(conversacionId: number, empresaId = 1) {
    const res = await this.dataSource.query(
      `SELECT MAX(created_at) as ultimo_mensaje_cliente_at
       FROM public.mensaje
       WHERE conversacion_id = $1 AND empresa_id = $2 AND direccion = 'inbound';`,
      [conversacionId, empresaId],
    );

    const lastCustomerMsg = res[0]?.ultimo_mensaje_cliente_at ? new Date(res[0].ultimo_mensaje_cliente_at) : null;
    const now = new Date();
    let activa = false;
    let minutosRestantes = 0;
    let expiraAt: Date | null = null;

    if (lastCustomerMsg) {
      const diffMs = now.getTime() - lastCustomerMsg.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const total24hMin = 24 * 60;
      if (diffMin < total24hMin) {
        activa = true;
        minutosRestantes = total24hMin - diffMin;
        expiraAt = new Date(lastCustomerMsg.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    return {
      activa,
      minutosRestantes,
      ultimoMensajeClienteAt: lastCustomerMsg,
      expiraAt,
    };
  }

  /**
   * Obtiene la lista de conversaciones activas desde PostgreSQL con estado de ventana de 24h.
   */
  async getConversacionesChat(empresaId = 1) {
    try {
      const rows = await this.dataSource.query(
        `SELECT * FROM (
           SELECT DISTINCT ON (c.tercero_id)
              c.id_conversacion AS id,
              c.empresa_id,
              c.tercero_id,
              c.canal_id,
              c.estado,
              COALESCE(c.modo, 'ia') AS modo,
              c.fecha_ultima_interaccion,
              COALESCE(NULLIF(TRIM(t.nombre), ''), NULLIF(TRIM(t.razon_social), ''), NULLIF(TRIM(t.whatsapp), ''), 'Cliente WhatsApp') AS nombre,
              COALESCE(NULLIF(TRIM(t.whatsapp), ''), NULLIF(TRIM(t.telefono), ''), '') AS whatsapp,
              t.email,
              m.contenido AS ultimo_mensaje,
              m.tipo AS ultimo_tipo,
              m.created_at AS hora_ultimo_mensaje,
              m_in.created_at AS ultimo_mensaje_cliente_at
            FROM public.conversacion c
            LEFT JOIN public.tercero t ON t.id_tercero = c.tercero_id
            LEFT JOIN LATERAL (
              SELECT contenido, tipo, created_at
              FROM public.mensaje
              WHERE conversacion_id = c.id_conversacion
              ORDER BY id_mensaje DESC
              LIMIT 1
            ) m ON true
            LEFT JOIN LATERAL (
              SELECT created_at
              FROM public.mensaje
              WHERE conversacion_id = c.id_conversacion AND direccion = 'inbound'
              ORDER BY id_mensaje DESC
              LIMIT 1
            ) m_in ON true
            WHERE c.empresa_id = $1
            ORDER BY c.tercero_id, c.fecha_ultima_interaccion DESC NULLS LAST, c.id_conversacion DESC
         ) sub
         ORDER BY sub.fecha_ultima_interaccion DESC NULLS LAST, sub.id DESC;`,
        [empresaId],
      );

      const now = new Date();
      return rows.map((r: any) => {
        const lastInbound = r.ultimo_mensaje_cliente_at ? new Date(r.ultimo_mensaje_cliente_at) : null;
        let ventanaActiva = false;
        let minutosRestantes = 0;
        let expiraAt: string | null = null;
        if (lastInbound) {
          const diffMs = now.getTime() - lastInbound.getTime();
          const diffMin = Math.floor(diffMs / (1000 * 60));
          if (diffMin < 24 * 60) {
            ventanaActiva = true;
            minutosRestantes = 24 * 60 - diffMin;
            expiraAt = new Date(lastInbound.getTime() + 24 * 60 * 60 * 1000).toISOString();
          }
        }

        const rawPhone = (r.whatsapp || '').replace(/\D/g, '');
        const formattedPhone = rawPhone
          ? (rawPhone.startsWith('57') ? `+${rawPhone}` : `+57${rawPhone}`)
          : '';

        return {
          id: Number(r.id),
          cliente_id: Number(r.tercero_id),
          nombre: r.nombre || 'Cliente WhatsApp',
          whatsapp: formattedPhone,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(r.nombre || 'cliente')}`,
          modo: r.modo,
          estado: r.estado,
          ultimo_mensaje: r.ultimo_mensaje || 'Conversación iniciada',
          hora: r.hora_ultimo_mensaje ? new Date(r.hora_ultimo_mensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
          ventana_servicio: {
            activa: ventanaActiva,
            minutos_restantes: minutosRestantes,
            expira_at: expiraAt,
            ultimo_cliente_at: lastInbound ? lastInbound.toISOString() : null,
          },
        };
      });
    } catch (err: any) {
      this.logger.error(`[Chat] Error al consultar conversaciones: ${err.message}`);
      throw new InternalServerErrorException('Error al consultar conversaciones de chat');
    }
  }

  /**
   * Obtiene o inicia una conversación para un cliente en PostgreSQL.
   */
  async obtenerOCrearConversacion(terceroId: number, empresaId = 1) {
    try {
      // 1. Verificar si ya existe conversación para este tercero
      const existing = await this.dataSource.query(
        `SELECT c.id_conversacion AS id
         FROM public.conversacion c
         WHERE c.tercero_id = $1 AND c.empresa_id = $2
         ORDER BY c.fecha_ultima_interaccion DESC NULLS LAST, c.id_conversacion DESC
         LIMIT 1;`,
        [terceroId, empresaId],
      );

      if (existing.length > 0) {
        const convId = Number(existing[0].id);
        const all = await this.getConversacionesChat(empresaId);
        const found = all.find((c: any) => c.id === convId);
        if (found) return found;
      }

      // 2. Obtener datos del tercero
      const terceroRows = await this.dataSource.query(
        `SELECT id_tercero, nombre, apellido, razon_social, whatsapp, telefono
         FROM public.tercero
         WHERE id_tercero = $1 AND empresa_id = $2;`,
        [terceroId, empresaId],
      );
      const tercero = terceroRows[0];
      if (!tercero) {
        throw new NotFoundException('Cliente no encontrado en la base de datos');
      }

      // 3. Obtener canal de WhatsApp de la empresa
      const canalRows = await this.dataSource.query(
        `SELECT id_canal FROM public.canal WHERE empresa_id = $1 AND tipo = 'whatsapp' ORDER BY id_canal ASC LIMIT 1;`,
        [empresaId],
      );
      const canalId = canalRows[0]?.id_canal || 1;

      // 4. Crear la conversación en PostgreSQL
      const insertRes = await this.dataSource.query(
        `INSERT INTO public.conversacion (empresa_id, tercero_id, canal_id, estado, modo, fecha_inicio, fecha_ultima_interaccion, created_at, updated_at)
         VALUES ($1, $2, $3, 'activa', 'humano', NOW(), NOW(), NOW(), NOW())
         RETURNING id_conversacion AS id;`,
        [empresaId, terceroId, canalId],
      );

      const newId = Number(insertRes[0]?.id);
      const all = await this.getConversacionesChat(empresaId);
      const found = all.find((c: any) => c.id === newId);
      if (found) return found;

      const rawPhone = (tercero.whatsapp || tercero.telefono || '').replace(/\D/g, '');
      const formattedPhone = rawPhone
        ? (rawPhone.startsWith('57') ? `+${rawPhone}` : `+57${rawPhone}`)
        : '';
      const clientName = (
        tercero.nombre
          ? `${tercero.nombre} ${tercero.apellido || ''}`.trim()
          : (tercero.razon_social || 'Cliente WhatsApp')
      ).trim();

      return {
        id: newId,
        cliente_id: Number(tercero.id_tercero),
        nombre: clientName,
        whatsapp: formattedPhone,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clientName)}`,
        modo: 'humano',
        estado: 'activa',
        ultimo_mensaje: 'Conversación iniciada',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ventana_servicio: {
          activa: false,
          minutos_restantes: 0,
          expira_at: null,
          ultimo_cliente_at: null,
        },
      };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al obtener o crear conversación: ${err.message}`);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Error al gestionar conversación del cliente');
    }
  }

  /**
   * Obtiene los productos y categorías disponibles en PostgreSQL y sincronizados con Meta.
   */
  async getCatalogoDisponibleChat(empresaId = 1) {
    try {
      const catRows = await this.dataSource.query(
        `SELECT
           c.id_categoria,
           c.nombre,
           COUNT(p.id_producto) FILTER (WHERE p.fb_product_id IS NOT NULL) AS total_productos
         FROM public.categoria c
         LEFT JOIN public.producto p ON p.categoria_id = c.id_categoria AND p.empresa_id = c.empresa_id
         WHERE c.empresa_id = $1 AND c.estado = 'activo'
         GROUP BY c.id_categoria, c.nombre
         HAVING COUNT(p.id_producto) FILTER (WHERE p.fb_product_id IS NOT NULL) > 0
         ORDER BY c.nombre ASC;`,
        [empresaId],
      );

      const prodRows = await this.dataSource.query(
        `SELECT
           p.id_producto,
           p.codigo_interno,
           p.nombre,
           p.descripcion_corta AS descripcion,
           COALESCE(p.precio_impuesto, p.precio_base, 0) AS precio,
           img.url AS imagen_principal,
           p.categoria_id,
           c.nombre AS categoria_nombre,
           p.fb_product_id,
           GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible
         FROM public.producto p
         LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
         LEFT JOIN public.inventario inv ON inv.producto_id = p.id_producto
         LEFT JOIN LATERAL (
           SELECT url FROM public.producto_imagen
           WHERE producto_id = p.id_producto AND estado = 'activo'
           ORDER BY principal DESC, orden ASC
           LIMIT 1
         ) img ON true
         WHERE p.empresa_id = $1 AND p.fb_product_id IS NOT NULL
         ORDER BY c.nombre, p.nombre ASC;`,
        [empresaId],
      );

      return {
        categorias: catRows.map((c: any) => ({
          id: Number(c.id_categoria),
          nombre: c.nombre,
          total_productos: Number(c.total_productos),
        })),
        productos: prodRows.map((p: any) => ({
          id: Number(p.id_producto),
          codigo_interno: p.codigo_interno,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          precio: Number(p.precio) || 0,
          imagen_principal: p.imagen_principal || null,
          categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
          categoria_nombre: p.categoria_nombre || 'General',
          disponible: Number(p.disponible) || 0,
        })),
      };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al obtener catálogo disponible: ${err.message}`);
      throw new InternalServerErrorException('Error al consultar productos para el chat');
    }
  }

  /**
   * Obtiene los mensajes de una conversación desde PostgreSQL.
   */
  async getMensajesConversacionChat(conversacionId: number, empresaId = 1) {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           m.id_mensaje AS id,
           m.conversacion_id,
           m.direccion,
           m.tipo,
           m.contenido,
           m.media_url,
           m.media_mime_type,
           m.metadata,
           m.created_at
         FROM public.mensaje m
         JOIN public.conversacion c ON c.id_conversacion = m.conversacion_id
         WHERE (
           m.conversacion_id = $1 
           OR c.tercero_id = (SELECT tercero_id FROM public.conversacion WHERE id_conversacion = $1 LIMIT 1)
         ) AND m.empresa_id = $2
         ORDER BY m.id_mensaje ASC;`,
        [conversacionId, empresaId],
      );

      return rows.map((m: any) => ({
        id: Number(m.id),
        emisor: m.direccion === 'inbound' ? 'cliente' : m.metadata?.enviado_por_tool ? 'ia' : 'asesor',
        tipo: m.tipo,
        texto: m.contenido,
        media_url: m.media_url,
        metadata: m.metadata,
        hora: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    } catch (err: any) {
      this.logger.error(`[Chat] Error al consultar mensajes: ${err.message}`);
      throw new InternalServerErrorException('Error al consultar mensajes de la conversación');
    }
  }

  /**
   * Alterna el modo de atención ('ia' vs 'humano') para una conversación.
   */
  async cambiarModoConversacion(conversacionId: number, modo: 'ia' | 'humano', empresaId = 1) {
    try {
      await this.dataSource.query(
        `UPDATE public.conversacion
         SET modo = $1, updated_at = NOW()
         WHERE id_conversacion = $2 AND empresa_id = $3;`,
        [modo, conversacionId, empresaId],
      );
      return { ok: true, conversacionId, modo };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al cambiar modo: ${err.message}`);
      throw new InternalServerErrorException('Error al cambiar modo de atención');
    }
  }

  /**
   * Envía un mensaje de texto por WhatsApp vía Meta Cloud API y lo persiste en PostgreSQL.
   */
  async enviarMensajeTextoChat(conversacionId: number, texto: string, empresaId = 1) {
    const ventana = await this.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException(
        'Ventana de atención de 24 horas cerrada. Para evitar cobros adicionales de marketing de Meta, solo puedes contestar cuando el cliente te haya escrito en las últimas 24 horas.',
      );
    }

    const { metaToken, apiVersion, phoneId } = await this.metaCatalogRepo.getMetaCatalogContext(empresaId);

    if (!texto || !texto.trim()) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono
       FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const conv = convRows[0];
    const phone = conv?.whatsapp || conv?.telefono;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      throw new BadRequestException('No se encontró número de WhatsApp para este contacto');
    }

    try {
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { body: texto.trim() },
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        const errText = data.error?.message || JSON.stringify(data);
        this.logger.error(`[Chat] Error enviando mensaje a WhatsApp: ${errText}`);
        throw new Error(errText);
      }

      const wamid = data.messages?.[0]?.id;
      if (typeof wamid !== 'string' || !wamid.trim()) {
        throw new BadRequestException('Meta no devolvió un identificador válido de mensaje; no se puede guardar.');
      }

      const insertRes = await this.dataSource.query(
        `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, external_message_id, created_at)
         VALUES ($1, $2, 'outbound', 'text', $3, $4, $5, NOW())
         RETURNING id_mensaje, created_at;`,
        [empresaId, conversacionId, texto.trim(), JSON.stringify({ wamid, origen: 'crm_asesor' }), wamid],
      );

      await this.dataSource.query(
        `UPDATE public.conversacion
         SET fecha_ultima_interaccion = NOW(), updated_at = NOW()
         WHERE id_conversacion = $1;`,
        [conversacionId],
      );

      return {
        ok: true,
        id: Number(insertRes[0]?.id_mensaje),
        wamid,
        hora: new Date(insertRes[0]?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        texto: texto.trim(),
      };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al enviar mensaje: ${err.message}`);
      throw new BadRequestException(`No se pudo enviar el mensaje por WhatsApp: ${err.message}`);
    }
  }
}
