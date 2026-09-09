import axios from 'axios';
import { getCookie } from 'cookies-next';

/**
 * Clave compartida utilizada para persistir los datos de sesión
 * tanto en Cookies como en el LocalStorage del navegador.
 */
const authSessionKey = '_REBACK_AUTH_KEY_';

/**
 * ============================================================================
 * CLIENTE HTTP (AXIOS)
 * ============================================================================
 * Instancia centralizada de Axios para realizar peticiones HTTP al backend.
 * - baseURL: Dirección del servidor backend (obtenida de .env con fallback a localhost:3000).
 * - headers: Formato de intercambio de datos predeterminado (JSON).
 * - timeout: Tiempo límite de espera (10 segundos) antes de cancelar la solicitud.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * ----------------------------------------------------------------------------
 * INTERCEPTOR DE PETICIONES (REQUEST INTERCEPTOR)
 * ----------------------------------------------------------------------------
 * Se ejecuta automáticamente ANTES de que cualquier solicitud salga hacia el backend:
 * 1. Busca si existe una sesión activa en las Cookies o en el LocalStorage.
 * 2. Si encuentra el token JWT (`session.token`), lo adjunta en el encabezado
 *    HTTP estándar `Authorization: Bearer <token>`.
 * 3. Si no hay token o la petición es pública (/login), continúa sin el header.
 */
apiClient.interceptors.request.use((config) => {
  try {
    // Intentar leer la sesión desde las cookies; si no está, leer desde localStorage
    const rawSession =
      getCookie(authSessionKey)?.toString() ||
      (typeof window !== 'undefined' && window.localStorage
        ? localStorage.getItem(authSessionKey)
        : null);

    if (rawSession) {
      const session = JSON.parse(rawSession);
      // Inyectar el token JWT en las cabeceras de autorización
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch (e) {
    // Si la cadena JSON está corrupta o falla la lectura, se ignora para no romper la app
  }
  return config;
});

/**
 * Fachada (Wrapper) que expone los métodos HTTP habituales de Axios
 * para un consumo limpio y desacoplado en los servicios.
 */
function HttpClient() {
  return {
    get: apiClient.get,
    post: apiClient.post,
    patch: apiClient.patch,
    put: apiClient.put,
    delete: apiClient.delete,
  };
}

export default HttpClient();