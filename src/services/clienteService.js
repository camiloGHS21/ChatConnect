import HttpClient from '@/helpers/httpClient';

/**
 * ============================================================================
 * SERVICIO DE CLIENTES (CRM WhatsApp ──► Backend NestJS ──► PostgreSQL)
 * ============================================================================
 * Conecta las vistas de Clientes con los datos reales en public.tercero y public.pedido.
 */
export const clienteService = {
  /**
   * Obtiene la lista de clientes con métricas consolidadas y filtros opcionales.
   */
  async getClientes(empresaId = 1, params = {}) {
    const query = new URLSearchParams({
      empresa_id: String(empresaId),
      ...(params.search ? { search: params.search } : {}),
    }).toString();

    const res = await HttpClient.get(`/clientes?${query}`);
    return res.data;
  },

  /**
   * Obtiene las métricas KPI consolidadas en tiempo real.
   */
  async getKpis(empresaId = 1) {
    const res = await HttpClient.get(`/clientes/kpis?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Consulta la ficha detallada de un cliente con su historial de pedidos.
   */
  async getCliente(id, empresaId = 1) {
    const res = await HttpClient.get(`/clientes/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Registra un nuevo cliente en el CRM (public.tercero).
   */
  async crearCliente(datos, empresaId = 1) {
    const res = await HttpClient.post(`/clientes?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Actualiza los datos de un cliente existente.
   */
  async actualizarCliente(id, datos, empresaId = 1) {
    const res = await HttpClient.patch(`/clientes/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },
};

export default clienteService;
