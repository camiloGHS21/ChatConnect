import httpClient from '@/helpers/httpClient';

/**
 * SERVICIO / MODEL DATA ACCESS: AuthService
 * Comunica el frontend con el endpoint MVC /login del backend NestJS
 */
export const authService = {
  /**
   * Envía credenciales de login al backend
   * @param {{ email: string, password: string }} credentials 
   * @returns {Promise<{ token: string, user: any, empresa: any }>}
   */
  async login(credentials) {
    const response = await httpClient.post('/login', credentials);
    return response.data;
  },

  /**
   * Verifica el estado del servicio de login
   */
  async checkStatus() {
    const response = await httpClient.get('/login');
    return response.data;
  },
};

export default authService;
