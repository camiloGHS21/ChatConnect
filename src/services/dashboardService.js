import HttpClient from '@/helpers/httpClient';

/**
 * ============================================================================
 * SERVICIO DEL PANEL DE INICIO (Frontend ──► Backend NestJS ──► PostgreSQL)
 * ============================================================================
 * Consume el resumen consolidado con datos reales de la base de datos.
 */
export const dashboardService = {
  /**
   * Obtiene el resumen del dashboard para la empresa indicada.
   */
  async getResumen(empresaId = 1) {
    const res = await HttpClient.get(`/dashboard?empresa_id=${empresaId}`);
    return res.data;
  },
};

export default dashboardService;
