import axios from 'axios';
import { getCookie } from 'cookies-next';

const authSessionKey = '_REBACK_AUTH_KEY_';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para inyectar token de sesión en las peticiones
apiClient.interceptors.request.use((config) => {
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
  } catch (e) {
    // Session parse error ignorado
  }
  return config;
});

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