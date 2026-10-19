import HttpClient from '@/helpers/httpClient';

/**
 * ============================================================================
 * SERVICIO DE PEDIDOS (Frontend ──► Backend NestJS ──► PostgreSQL)
 * ============================================================================
 * Conecta la interfaz de usuario con la API de Pedidos y órdenes de WhatsApp.
 */
export const pedidoService = {
  /**
   * Obtiene la lista de pedidos de la empresa con filtros opcionales.
   */
  async getPedidos(empresaId = 1, params = {}) {
    const query = new URLSearchParams({
      empresa_id: String(empresaId),
      ...(params.estado && params.estado !== 'all' ? { estado: params.estado } : {}),
      ...(params.search ? { search: params.search } : {}),
    }).toString();

    const res = await HttpClient.get(`/pedido?${query}`);
    return res.data;
  },

  /**
   * Obtiene las métricas KPI consolidadas en tiempo real.
   */
  async getKpis(empresaId = 1) {
    const res = await HttpClient.get(`/pedido/kpis?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Consulta el detalle completo de un pedido específico.
   */
  async getPedido(id, empresaId = 1) {
    const res = await HttpClient.get(`/pedido/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Actualiza el estado del pedido en PostgreSQL (con historial).
   */
  async actualizarEstado(id, estado, comentario, empresaId = 1) {
    const res = await HttpClient.patch(`/pedido/${id}/estado?empresa_id=${empresaId}`, { estado, comentario });
    return res.data;
  },
};

export default pedidoService;
