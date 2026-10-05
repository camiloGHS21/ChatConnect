import HttpClient from '@/helpers/httpClient';

/**
 * =============================================================================
 * SERVICIO: Gestión y Purga de Datos de Empresa
 * =============================================================================
 * Comunica con el backend NestJS (EmpresaLimpiezaController) y PostgreSQL.
 */
export const empresaDatosService = {
  /**
   * Obtiene el resumen de registros actuales por módulo para la empresa.
   */
  async getResumen(empresaId = 1) {
    const res = await HttpClient.get(`/empresa-datos/resumen?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Ejecuta la purga selectiva o total en la base de datos PostgreSQL.
   */
  async purgarDatos(opciones, empresaId = 1) {
    const res = await HttpClient.post(`/empresa-datos/purgar?empresa_id=${empresaId}`, {
      ...opciones,
      empresa_id: empresaId,
    });
    return res.data;
  },
};

export default empresaDatosService;
