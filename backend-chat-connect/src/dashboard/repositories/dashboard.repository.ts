import { Injectable } from '@nestjs/common';
import { DashboardOperacionRepository } from './dashboard-operacion.repository.js';
import { DashboardChatRepository } from './dashboard-chat.repository.js';

/**
 * ============================================================================
 * REPOSITORIO FACHADA (Dashboard) — Resumen del Panel de Inicio
 * ============================================================================
 * Coordina los sub-repositorios especializados y consolida una sola respuesta
 * con datos reales de PostgreSQL para el dashboard (RULE 1 y RULE 3).
 */
@Injectable()
export class DashboardRepository {
  constructor(
    private readonly operacion: DashboardOperacionRepository,
    private readonly chat: DashboardChatRepository,
  ) {}

  /** Construye las etiquetas de los últimos 12 meses (ej. 'ene', 'feb'). */
  private mesesRecientes() {
    const meses: { ym: string; label: string }[] = [];
    const hoy = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
      meses.push({ ym, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return meses;
  }

  /** Convierte una lista {name, amount} agregando el porcentaje sobre el total. */
  private conPorcentaje(items: { name: string; amount: number }[]) {
    const total = items.reduce((acc, it) => acc + it.amount, 0);
    return items.map((it) => ({
      ...it,
      porcentaje: total > 0 ? Number(((it.amount / total) * 100).toFixed(1)) : 0,
    }));
  }

  /** Resumen consolidado del panel de inicio con datos reales de la BD. */
  async obtenerResumen(empresaId = 1) {
    const [
      clientes,
      pedidosKpi,
      invKpi,
      conversaciones,
      mensajesTotal,
      modo,
      ultimosPedidos,
      zonas,
      topProductos,
      seriePedidos,
      serieMensajes,
      canales,
    ] = await Promise.all([
      this.operacion.contarClientes(empresaId),
      this.operacion.kpisPedidos(empresaId),
      this.operacion.kpisInventario(empresaId),
      this.chat.contarConversaciones(empresaId),
      this.chat.contarMensajes(empresaId),
      this.chat.distribucionModo(empresaId),
      this.operacion.ultimosPedidos(empresaId, 4),
      this.operacion.zonasEntrega(empresaId, 6),
      this.operacion.topProductos(empresaId, 5),
      this.operacion.seriePedidosMensual(empresaId),
      this.chat.serieMensajesMensual(empresaId),
      this.chat.canalesAtencion(empresaId, 5),
    ]);

    const meses = this.mesesRecientes();
    const pedidosPorMes = new Map<string, number>(
      (seriePedidos as { ym: string; total: number }[]).map((r) => [r.ym, r.total]),
    );
    const mensajesPorMes = new Map<string, number>(
      (serieMensajes as { ym: string; total: number }[]).map((r) => [r.ym, r.total]),
    );

    const totalModo = modo.ia + modo.humano;

    return {
      generado_en: new Date().toISOString(),
      kpis: {
        clientes_whatsapp: clientes,
        conversaciones,
        mensajes_total: mensajesTotal,
        pedidos_total: pedidosKpi.total_pedidos,
        ventas_total: pedidosKpi.ventas_total,
        pedidos_hoy: pedidosKpi.pedidos_hoy,
        monto_hoy: pedidosKpi.monto_hoy,
        productos_activos: invKpi.productos_activos,
        stock_criticos: invKpi.stock_criticos,
        stock_disponible_total: invKpi.stock_disponible_total,
      },
      automatizacion: {
        ia: modo.ia,
        humano: modo.humano,
        ia_porcentaje: totalModo > 0 ? Number(((modo.ia / totalModo) * 100).toFixed(1)) : 0,
      },
      series: {
        etiquetas: meses.map((m) => m.label),
        mensajes: meses.map((m) => mensajesPorMes.get(m.ym) || 0),
        pedidos: meses.map((m) => pedidosPorMes.get(m.ym) || 0),
      },
      ultimos_pedidos: ultimosPedidos,
      zonas_entrega: this.conPorcentaje(zonas),
      canales_atencion: this.conPorcentaje(canales),
      top_productos: topProductos,
    };
  }
}
