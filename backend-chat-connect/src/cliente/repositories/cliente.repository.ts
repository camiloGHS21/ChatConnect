import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto.js';

@Injectable()
export class ClienteRepository {
  private readonly logger = new Logger(ClienteRepository.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Lista todos los clientes WhatsApp de la empresa con sus métricas consolidadas.
   */
  async listar(empresaId = 1, filtros?: { search?: string }) {
    let sql = `
      SELECT 
        t.id_tercero AS id,
        t.id_tercero,
        t.empresa_id,
        t.tipo_persona,
        t.tipo_tercero,
        t.tipo_documento,
        t.numero_documento,
        t.digito_verificacion,
        t.nombre AS primer_nombre,
        t.apellido,
        t.razon_social,
        COALESCE(
          CASE 
            WHEN t.tipo_persona = 'natural' THEN TRIM(CONCAT(COALESCE(t.nombre, ''), ' ', COALESCE(t.apellido, '')))
            ELSE COALESCE(t.razon_social, t.nombre)
          END,
          t.whatsapp,
          'Cliente sin nombre'
        ) AS nombre,
        COALESCE(t.email, '') AS email,
        COALESCE(t.telefono, '') AS telefono,
        COALESCE(t.whatsapp, t.telefono, '') AS whatsapp,
        COALESCE(t.departamento, '') AS departamento,
        COALESCE(t.ciudad, '') AS ciudad,
        COALESCE(t.direccion, '') AS direccion,
        t.latitud,
        t.longitud,
        t.estado,
        t.created_at,
        t.updated_at,
        COALESCE(ped.pedidos_count, 0)::int AS pedidos_count,
        COALESCE(ped.total_compras, 0)::numeric AS total_compras
      FROM public.tercero t
      LEFT JOIN (
        SELECT 
          tercero_id,
          COUNT(id_pedido) AS pedidos_count,
          SUM(total) AS total_compras
        FROM public.pedido
        WHERE empresa_id = $1
        GROUP BY tercero_id
      ) ped ON ped.tercero_id = t.id_tercero
      WHERE t.empresa_id = $1
        AND t.tipo_tercero IN ('cliente', 'ambos')
        AND t.estado = 'activo'
    `;

    const params: any[] = [empresaId];

    if (filtros?.search && filtros.search.trim()) {
      params.push(`%${filtros.search.trim().toLowerCase()}%`);
      sql += ` AND (
        LOWER(COALESCE(t.nombre, '')) LIKE $${params.length}
        OR LOWER(COALESCE(t.apellido, '')) LIKE $${params.length}
        OR LOWER(COALESCE(t.razon_social, '')) LIKE $${params.length}
        OR LOWER(COALESCE(t.numero_documento, '')) LIKE $${params.length}
        OR COALESCE(t.whatsapp, '') LIKE $${params.length}
        OR LOWER(COALESCE(t.ciudad, '')) LIKE $${params.length}
      )`;
    }

    sql += ` ORDER BY t.updated_at DESC, t.id_tercero DESC`;

    const rows = await this.dataSource.query(sql, params);

    return rows.map((r: any) => ({
      id: Number(r.id),
      id_tercero: Number(r.id_tercero),
      tipo_persona: r.tipo_persona,
      tipo_tercero: r.tipo_tercero,
      nombre: (r.nombre || '').trim() || 'Cliente WhatsApp',
      primer_nombre: r.primer_nombre,
      apellido: r.apellido,
      razon_social: r.razon_social,
      email: r.email || 'sin-correo@cliente.com',
      whatsapp: r.whatsapp || 'Sin WhatsApp',
      whatsapp_raw: (r.whatsapp || '').replace(/\D/g, ''),
      documento: r.numero_documento ? (r.digito_verificacion ? `${r.numero_documento}-${r.digito_verificacion}` : r.numero_documento) : 'Sin doc',
      numero_documento: r.numero_documento,
      tipo_documento: r.tipo_documento || 'CC',
      digito_verificacion: r.digito_verificacion,
      ciudad: r.ciudad || 'No especificada',
      departamento: r.departamento || '',
      direccion: r.direccion || 'Sin dirección',
      latitud: r.latitud ? Number(r.latitud) : null,
      longitud: r.longitud ? Number(r.longitud) : null,
      avatar: '/images/users/avatar-1.jpg',
      pedidos_count: Number(r.pedidos_count || 0),
      total_compras: Number(r.total_compras || 0),
      created_at: r.created_at,
    }));
  }

  /**
   * Obtiene los KPIs de clientes para las tarjetas métricas del CRM.
   */
  async obtenerKpis(empresaId = 1) {
    const statsSql = `
      SELECT
        COUNT(DISTINCT t.id_tercero)::int AS total_clientes,
        COUNT(DISTINCT CASE 
          WHEN (t.latitud IS NOT NULL AND t.longitud IS NOT NULL) 
            OR (t.ciudad IS NOT NULL AND LENGTH(TRIM(t.ciudad)) > 0) 
            OR (t.direccion IS NOT NULL AND LENGTH(TRIM(t.direccion)) > 0)
          THEN t.id_tercero 
        END)::int AS georreferenciados_count,
        COALESCE(COUNT(p.id_pedido), 0)::int AS pedidos_formalizados,
        COALESCE(SUM(p.total), 0)::numeric AS ventas_whatsapp
      FROM public.tercero t
      LEFT JOIN public.pedido p ON p.tercero_id = t.id_tercero AND p.empresa_id = $1
      WHERE t.empresa_id = $1
        AND t.tipo_tercero IN ('cliente', 'ambos')
        AND t.estado = 'activo';
    `;

    const rows = await this.dataSource.query(statsSql, [empresaId]);
    const r = rows[0] || {};
    const totalClientes = Number(r.total_clientes || 0);
    const georrefCount = Number(r.georreferenciados_count || 0);
    const pctGeorref = totalClientes > 0 ? Math.round((georrefCount / totalClientes) * 100) : 0;

    return {
      total_clientes: totalClientes,
      pedidos_formalizados: Number(r.pedidos_formalizados || 0),
      ventas_whatsapp: Number(r.ventas_whatsapp || 0),
      georreferenciados_porcentaje: pctGeorref,
    };
  }

  /**
   * Consulta el detalle de un cliente específico incluyendo su historial de pedidos.
   */
  async obtenerPorId(id: number, empresaId = 1) {
    const sql = `
      SELECT 
        t.id_tercero AS id,
        t.empresa_id,
        t.tipo_persona,
        t.tipo_tercero,
        t.tipo_documento,
        t.numero_documento,
        t.digito_verificacion,
        t.nombre AS primer_nombre,
        t.apellido,
        t.razon_social,
        COALESCE(
          CASE 
            WHEN t.tipo_persona = 'natural' THEN TRIM(CONCAT(COALESCE(t.nombre, ''), ' ', COALESCE(t.apellido, '')))
            ELSE COALESCE(t.razon_social, t.nombre)
          END,
          t.whatsapp,
          'Cliente sin nombre'
        ) AS nombre,
        t.email,
        t.telefono,
        COALESCE(t.whatsapp, t.telefono, '') AS whatsapp,
        t.departamento,
        t.ciudad,
        t.direccion,
        t.latitud,
        t.longitud,
        t.estado,
        t.created_at,
        t.updated_at
      FROM public.tercero t
      WHERE t.id_tercero = $1 AND t.empresa_id = $2 AND t.tipo_tercero IN ('cliente', 'ambos')
      LIMIT 1;
    `;

    const rows = await this.dataSource.query(sql, [id, empresaId]);
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const c = rows[0];

    // Obtener pedidos del cliente
    const ordersSql = `
      SELECT 
        p.id_pedido AS id,
        p.numero_pedido,
        to_char(p.created_at, 'DD/MM/YYYY HH12:MI AM') AS fecha,
        COALESCE(p.tipo_entrega, 'domicilio') AS tipo_entrega,
        p.total::numeric AS total,
        p.estado,
        p.subtotal::numeric AS subtotal,
        p.envio::numeric AS envio,
        (SELECT COUNT(*) FROM public.pedido_detalle pd WHERE pd.pedido_id = p.id_pedido)::int AS items_count
      FROM public.pedido p
      WHERE p.tercero_id = $1 AND p.empresa_id = $2
      ORDER BY p.id_pedido DESC;
    `;

    const orders = await this.dataSource.query(ordersSql, [id, empresaId]);
    const totalCompras = orders.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);

    return {
      id: Number(c.id),
      id_tercero: Number(c.id),
      tipo_persona: c.tipo_persona,
      tipo_tercero: c.tipo_tercero,
      nombre: (c.nombre || '').trim() || 'Cliente WhatsApp',
      primer_nombre: c.primer_nombre,
      apellido: c.apellido,
      razon_social: c.razon_social,
      email: c.email || 'sin-correo@cliente.com',
      whatsapp: c.whatsapp || 'Sin WhatsApp',
      whatsapp_raw: (c.whatsapp || '').replace(/\D/g, ''),
      documento: c.numero_documento ? (c.digito_verificacion ? `${c.numero_documento}-${c.digito_verificacion}` : c.numero_documento) : 'Sin doc',
      numero_documento: c.numero_documento,
      tipo_documento: c.tipo_documento || 'CC',
      ciudad: c.ciudad || 'No especificada',
      departamento: c.departamento || '',
      direccion: c.direccion || 'Sin dirección',
      latitud: c.latitud ? Number(c.latitud) : null,
      longitud: c.longitud ? Number(c.longitud) : null,
      avatar: '/images/users/avatar-1.jpg',
      pedidos_count: orders.length,
      total_compras: totalCompras,
      pedidos: orders.map((o: any) => ({
        id: Number(o.id),
        numero_pedido: o.numero_pedido,
        fecha: o.fecha,
        tipo_entrega: o.tipo_entrega,
        total: Number(o.total || 0),
        estado: o.estado,
        subtotal: Number(o.subtotal || 0),
        items_count: Number(o.items_count || 0),
      })),
    };
  }

  /**
   * Crea un nuevo cliente en public.tercero.
   */
  async crear(dto: CreateClienteDto, empresaId = 1) {
    const esNatural = (dto.tipo_persona || 'natural') === 'natural';
    const nombre = (dto.nombre || '').trim();
    const apellido = (dto.apellido || '').trim();
    const razonSocial = (dto.razon_social || '').trim();

    if (esNatural && !nombre && !apellido) {
      throw new BadRequestException('El nombre o apellido es requerido para persona natural');
    }
    if (!esNatural && !razonSocial) {
      throw new BadRequestException('La razón social es requerida para persona jurídica');
    }

    const doc = (dto.numero_documento || '').trim();
    const rawWa = (dto.whatsapp || dto.celular || dto.telefono || '').trim();
    const cleanWa = rawWa ? rawWa.replace(/\D/g, '') : null;

    // Verificar unicidad si tiene documento
    if (doc) {
      const dupDoc = await this.dataSource.query(
        `SELECT id_tercero FROM public.tercero WHERE empresa_id = $1 AND numero_documento = $2 LIMIT 1;`,
        [empresaId, doc],
      );
      if (dupDoc && dupDoc.length > 0) {
        throw new BadRequestException(`Ya existe un tercero registrado con el documento ${doc}`);
      }
    }

    // Si tiene whatsapp verificar que no exista duplicado para la misma empresa
    if (cleanWa) {
      const dupWa = await this.dataSource.query(
        `SELECT id_tercero FROM public.tercero WHERE empresa_id = $1 AND whatsapp = $2 LIMIT 1;`,
        [empresaId, cleanWa],
      );
      if (dupWa && dupWa.length > 0) {
        throw new BadRequestException(`Ya existe un cliente con el número de WhatsApp ${cleanWa}`);
      }
    }

    const sql = `
      INSERT INTO public.tercero (
        empresa_id, tipo_persona, tipo_tercero, tipo_documento, numero_documento, digito_verificacion,
        nombre, apellido, razon_social, email, telefono, whatsapp,
        id_departamento, id_ciudad, departamento, ciudad, direccion, latitud, longitud, estado
      ) VALUES ($1, $2, 'cliente', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'activo')
      RETURNING *;
    `;

    const rows = await this.dataSource.query(sql, [
      empresaId,
      esNatural ? 'natural' : 'juridica',
      dto.tipo_documento || (esNatural ? 'CC' : 'NIT'),
      doc || null,
      dto.digito_verificacion || null,
      esNatural ? (nombre || null) : null,
      esNatural ? (apellido || null) : null,
      esNatural ? null : (razonSocial || nombre || null),
      dto.email ? dto.email.trim() : null,
      dto.telefono ? dto.telefono.trim() : null,
      cleanWa || null,
      dto.id_departamento ? Number(dto.id_departamento) : null,
      dto.id_ciudad ? Number(dto.id_ciudad) : null,
      dto.departamento ? dto.departamento.trim() : null,
      dto.ciudad ? dto.ciudad.trim() : null,
      dto.direccion ? dto.direccion.trim() : null,
      dto.latitud !== undefined && dto.latitud !== null ? Number(dto.latitud) : null,
      dto.longitud !== undefined && dto.longitud !== null ? Number(dto.longitud) : null,
    ]);

    const created = rows[0];
    return {
      id: Number(created.id_tercero),
      id_tercero: Number(created.id_tercero),
      tipo_persona: created.tipo_persona,
      tipo_tercero: created.tipo_tercero,
      nombre: esNatural ? `${nombre} ${apellido}`.trim() : (razonSocial || nombre),
      email: created.email || 'sin-correo@cliente.com',
      whatsapp: created.whatsapp || 'Sin WhatsApp',
      whatsapp_raw: (created.whatsapp || '').replace(/\D/g, ''),
      documento: created.numero_documento || 'Sin doc',
      numero_documento: created.numero_documento,
      tipo_documento: created.tipo_documento,
      ciudad: created.ciudad || 'No especificada',
      departamento: created.departamento || '',
      direccion: created.direccion || 'Sin dirección',
      avatar: '/images/users/avatar-1.jpg',
      pedidos_count: 0,
      total_compras: 0,
      created_at: created.created_at,
    };
  }

  /**
   * Actualiza los datos de un cliente.
   */
  async actualizar(id: number, dto: UpdateClienteDto, empresaId = 1) {
    const existing = await this.dataSource.query(
      `SELECT * FROM public.tercero WHERE id_tercero = $1 AND empresa_id = $2;`,
      [id, empresaId],
    );
    if (!existing || existing.length === 0) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const cleanWa = dto.whatsapp !== undefined
      ? (dto.whatsapp ? dto.whatsapp.replace(/\D/g, '') : null)
      : undefined;

    const updates: string[] = ['updated_at = now()'];
    const params: any[] = [id, empresaId];

    const addField = (col: string, val: any) => {
      if (val !== undefined) {
        params.push(val);
        updates.push(`${col} = $${params.length}`);
      }
    };

    addField('tipo_persona', dto.tipo_persona);
    addField('tipo_documento', dto.tipo_documento);
    addField('numero_documento', dto.numero_documento);
    addField('digito_verificacion', dto.digito_verificacion);
    addField('nombre', dto.nombre);
    addField('apellido', dto.apellido);
    addField('razon_social', dto.razon_social);
    addField('email', dto.email);
    addField('telefono', dto.telefono);
    if (cleanWa !== undefined) addField('whatsapp', cleanWa);
    addField('departamento', dto.departamento);
    addField('ciudad', dto.ciudad);
    addField('direccion', dto.direccion);
    if (dto.latitud !== undefined) addField('latitud', dto.latitud ? Number(dto.latitud) : null);
    if (dto.longitud !== undefined) addField('longitud', dto.longitud ? Number(dto.longitud) : null);
    addField('estado', dto.estado);

    const updateSql = `
      UPDATE public.tercero
      SET ${updates.join(', ')}
      WHERE id_tercero = $1 AND empresa_id = $2
      RETURNING *;
    `;

    const res = await this.dataSource.query(updateSql, params);
    return res[0];
  }
}
