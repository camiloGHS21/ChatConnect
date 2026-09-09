import axios from 'axios';
import { getCookie } from 'cookies-next';

/**
 * Clave compartida utilizada para persistir los datos de sesión
 * tanto en Cookies como en el LocalStorage del navegador.
 */
const authSessionKey = '_REBACK_AUTH_KEY_';

/**
 * ============================================================================
 * CLIENTE HTTP (AXIOS) CON PROTECCIÓN CSRF Y JWT
 * ============================================================================
 * Instancia centralizada de Axios para realizar peticiones HTTP al backend.
 * - withCredentials: true permite el intercambio de cookies firmadas (_csrf) con el backend.
 * - baseURL: Dirección del servidor backend.
 * - timeout: Tiempo límite de espera (10 segundos).
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

/** Token CSRF en memoria caché para evitar peticiones redundantes */
let cachedCsrfToken = null;

/**
 * Solicita un nuevo token CSRF al backend y asegura la recepción de la cookie `_csrf`.
 */
export async function getCsrfToken() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/login/csrf-token`,
      { withCredentials: true }
    );
    cachedCsrfToken = res.data?.csrfToken;
    return cachedCsrfToken;
  } catch (error) {
    console.warn('No se pudo obtener el token CSRF:', error);
    return null;
  }
}

/**
 * ----------------------------------------------------------------------------
 * INTERCEPTOR DE PETICIONES (REQUEST INTERCEPTOR)
 * ----------------------------------------------------------------------------
 * 1. Para métodos mutables (POST, PUT, PATCH, DELETE), inyecta la cabecera `x-csrf-token`.
 * 2. Inyecta el token de sesión JWT en `Authorization: Bearer <token>` si el usuario está autenticado.
 */
apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase() || 'get';
  const isMutatingMethod = ['post', 'put', 'patch', 'delete'].includes(method);

  // 1. Inyección de Token CSRF en peticiones mutables
  if (isMutatingMethod) {
    if (!cachedCsrfToken) {
      await getCsrfToken();
    }
    if (cachedCsrfToken) {
      config.headers['x-csrf-token'] = cachedCsrfToken;
    }
  }

  // 2. Inyección de Token JWT de sesión
  try {
    const rawSession =
      getCookie(authSessionKey)?.toString() ||
      (typeof window !== 'undefined' && window.localStorage
        ? localStorage.getItem(authSessionKey)
        : null);

    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch {
    // Session parse error ignorado
  }

  return config;
});

/**
 * ----------------------------------------------------------------------------
 * INTERCEPTOR DE RESPUESTAS (RESPONSE INTERCEPTOR)
 * ----------------------------------------------------------------------------
 * Si el servidor responde 403 por token CSRF inválido o expirado,
 * renueva automáticamente el token y reintenta la petición original una vez.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === 'FST_CSRF_INVALID_TOKEN' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      cachedCsrfToken = null;
      const newToken = await getCsrfToken();
      if (newToken) {
        originalRequest.headers['x-csrf-token'] = newToken;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

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