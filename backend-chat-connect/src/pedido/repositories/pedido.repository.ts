import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoModel } from '../models/pedido.model.js';

/**
 * ============================================================================
 * REPOSITORIO DE PEDIDOS (Solo Lectura / Read-Only ──► PostgreSQL)
 * ============================================================================
 * Maneja consultas operativas de pedidos y órdenes WhatsApp en modo lectura.
 * No permite mutaciones destructivas, actualizaciones ni eliminaciones directas.
 */
@Injectable()
export class PedidoRepository {
  constructor(
    @InjectRepository(PedidoModel)
    private readonly pedidoRepo: Repository<PedidoModel>,
  ) {}

  /**
   * Lista todos los pedidos con sus terceros, ítems y productos asociados.
   */
  async listar(empresaId: number, filtros?: { estado?: string; search?: string }) {
    const qb = this.pedidoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.tercero', 't')
      .leftJoinAndSelect('p.detalles', 'd')
      .leftJoinAndSelect('d.producto', 'prod')
      .where('p.empresaId = :empresaId', { empresaId })
      .orderBy('p.id', 'DESC');

    if (filtros?.estado && filtros.estado !== 'all') {
      qb.andWhere('LOWER(p.estado) = LOWER(:estado)', { estado: filtros.estado });
    }

    if (filtros?.search && filtros.search.trim()) {
      const term = `%${filtros.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(p.numeroPedido) LIKE :term OR LOWER(t.nombre) LIKE :term OR LOWER(t.apellido) LIKE :term OR LOWER(t.razonSocial) LIKE :term OR t.whatsapp LIKE :term)',
        { term },
      );
    }

    const pedidos = await qb.getMany();
    return pedidos.map((p) => this.mapearPedidoFrontend(p));
  }

  /**
   * Obtiene los KPIs de facturación y volumen de pedidos para el dashboard.
   */
  async obtenerKpis(empresaId: number) {
    const res = await this.pedidoRepo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'total')
      .addSelect('COALESCE(SUM(p.total), 0)', 'total_ventas')
      .addSelect(
        "COUNT(CASE WHEN p.estado IN ('en_preparacion', 'despachado', 'pendiente', 'confirmado') THEN 1 END)",
        'en_curso',
      )
      .addSelect(
        "COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END)",
        'entregados',
      )
      .where('p.empresaId = :empresaId', { empresaId })
      .getRawOne();

    return {
      totalOrders: Number(res?.total || 0),
      totalVentas: Number(res?.total_ventas || 0),
      totalEnCurso: Number(res?.en_curso || 0),
      totalEntregados: Number(res?.entregados || 0),
    };
  }

  /**
   * Obtiene un pedido completo por su identificador.
   */
  async obtenerPorId(id: number, empresaId: number) {
    const pedido = await this.pedidoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.tercero', 't')
      .leftJoinAndSelect('p.detalles', 'd')
      .leftJoinAndSelect('d.producto', 'prod')
      .leftJoinAndSelect('p.estados', 'e')
      .where('p.id = :id AND p.empresaId = :empresaId', { id, empresaId })
      .orderBy('e.createdAt', 'ASC')
      .getOne();

    if (!pedido) {
      throw new NotFoundException(`Pedido #${id} no encontrado en la empresa ${empresaId}`);
    }

    return this.mapearPedidoFrontend(pedido);
  }

  /**
   * Formatea la entidad Pedido para consumo homogéneo por el cliente web y WhatsApp.
   */
  private mapearPedidoFrontend(p: PedidoModel) {
    const t = p.tercero;
    const nombreCliente = t
      ? (t.razonSocial || `${t.nombre || ''} ${t.apellido || ''}`).trim() || 'Cliente WhatsApp'
      : 'Cliente Sin Registrar';

    const rawWhatsapp = t?.whatsapp?.replace(/\D/g, '') || '';
    const formattedWhatsapp = rawWhatsapp
      ? rawWhatsapp.startsWith('57')
        ? `+${rawWhatsapp.slice(0, 2)} ${rawWhatsapp.slice(2, 5)} ${rawWhatsapp.slice(5, 8)} ${rawWhatsapp.slice(8)}`
        : `+${rawWhatsapp}`
      : 'Sin WhatsApp';

    return {
      id: Number(p.id),
      numero_pedido: p.numeroPedido,
      cliente_id: Number(p.terceroId),
      cliente_nombre: nombreCliente,
      whatsapp: formattedWhatsapp,
      whatsapp_raw: rawWhatsapp,
      fecha: this.formatearFechaHumana(p.createdAt),
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      tipo_entrega: p.tipoEntrega || 'domicilio',
      direccion_entrega: p.direccionEntrega || 'Retiro en Tienda',
      latitud: p.latitud ? Number(p.latitud) : null,
      longitud: p.longitud ? Number(p.longitud) : null,
      subtotal: Number(p.subtotal || 0),
      descuento: Number(p.descuento || 0),
      impuesto: Number(p.impuesto || 0),
      envio: Number(p.envio || 0),
      total: Number(p.total || 0),
      estado: p.estado || 'pendiente',
      nota: p.nota,
      items: (p.detalles || []).map((d) => ({
        id: Number(d.id),
        producto_id: Number(d.productoId),
        producto: d.producto?.nombre || `Producto #${d.productoId}`,
        codigo: d.producto?.codigoInterno || null,
        cantidad: Number(d.cantidad),
        unitario: Number(d.precioUnitario),
        precio_unitario: Number(d.precioUnitario),
        descuento: Number(d.descuento || 0),
        impuesto: Number(d.impuesto || 0),
        subtotal: Number(d.total),
        total: Number(d.total),
        nota: d.nota,
      })),
      historial_estados: (p.estados || []).map((e) => ({
        id: Number(e.id),
        estado: e.estado,
        comentario: e.comentario,
        created_at: e.createdAt,
      })),
    };
  }

  private formatearFechaHumana(fecha: Date | string): string {
    if (!fecha) return 'Reciente';
    const d = new Date(fecha);
    const ahora = new Date();
    const esHoy =
      d.getDate() === ahora.getDate() &&
      d.getMonth() === ahora.getMonth() &&
      d.getFullYear() === ahora.getFullYear();

    const tiempo = d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (esHoy) {
      return `Hoy ${tiempo}`;
    }

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const esAyer =
      d.getDate() === ayer.getDate() &&
      d.getMonth() === ayer.getMonth() &&
      d.getFullYear() === ayer.getFullYear();

    if (esAyer) {
      return `Ayer ${tiempo}`;
    }

    return `${d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${tiempo}`;
  }
}
