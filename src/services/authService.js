import httpClient from '@/helpers/httpClient';

/**
 * ============================================================================
 * SERVICIO / ACCESO A DATOS: AuthService
 * ============================================================================
 * Capa de abstracción que comunica el frontend con el módulo de autenticación
 * en el backend NestJS (http://localhost:3000/login).
 *
 * Desacopla la lógica de UI de las llamadas de red y endpoints específicos.
 */
export const authService = {
  /**
   * Envía las credenciales del usuario al backend para su autenticación.
   *
   * @param {{ email: string, password: string }} credentials - Correo y contraseña
   * @returns {Promise<{ token: string, user: Object, empresa: Object }>}
   *          Retorna los datos de sesión generados por el backend:
   *          - token: JWT para autorizar peticiones protegidas.
   *          - user: Datos del usuario autenticado (id, nombre, rol, empresa_id).
   *          - empresa: Información de la empresa a la que pertenece.
   * @throws {AxiosError} En caso de credenciales inválidas (401) o fallos de red.
   */
  async login(credentials) {
    // Realiza petición POST al endpoint '/login' con las credenciales en el cuerpo
    const response = await httpClient.post('/login', credentials);
    // Retorna el cuerpo JSON procesado
    return response.data;
  },

  /**
   * Consulta de prueba/diagnóstico para verificar el estado de la API de autenticación.
   * Útil para comprobar si el backend está activo y respondiendo.
   *
   * @returns {Promise<{ status: string, message: string }>}
   */
  async checkStatus() {
    const response = await httpClient.get('/login');
    return response.data;
  },
};

export default authService;
