import HttpClient from '@/helpers/httpClient';

/**
 * ============================================================================
 * SERVICIO DE INVENTARIO (Frontend ──► Backend NestJS ──► PostgreSQL)
 * ============================================================================
 * Conecta las vistas de Control de Inventario con las existencias en tiempo real.
 */
export const inventarioService = {
  /**
   * Obtiene la lista de inventario con filtros de búsqueda y nivel.
   */
  async getInventario(empresaId = 1, params = {}) {
    const query = new URLSearchParams({
      empresa_id: String(empresaId),
      ...(params.search ? { search: params.search } : {}),
      ...(params.filter && params.filter !== 'all' ? { filter: params.filter } : {}),
    }).toString();

    const res = await HttpClient.get(`/inventario?${query}`);
    return res.data;
  },

  /**
   * Obtiene los KPIs consolidados de existencias, reservas y stock crítico.
   */
  async getKpis(empresaId = 1) {
    const res = await HttpClient.get(`/inventario/kpis?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Ajusta la existencia física de un producto en la base de datos.
   */
  async ajustarStock(productoId, nuevaExistencia, motivo = '', empresaId = 1) {
    const res = await HttpClient.post(`/inventario/${productoId}/ajuste?empresa_id=${empresaId}`, {
      existencia: Number(nuevaExistencia),
      motivo,
    });
    return res.data;
  },
};

export default inventarioService;
