import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Contexto de React para exponer la sesión de usuario y métodos de autenticación
 * en cualquier parte del árbol de componentes.
 */
const AuthContext = createContext(undefined);

/**
 * Hook para consumir el contexto de autenticación en cualquier componente.
 * Lanza un error amigable si se intenta usar fuera del `<AuthProvider>`.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Clave utilizada para almacenar la sesión tanto en Cookies como en LocalStorage.
 */
const authSessionKey = '_REBACK_AUTH_KEY_';

/**
 * ============================================================================
 * PROVEEDOR DE AUTENTICACIÓN (AuthProvider)
 * ============================================================================
 * Envuelve la aplicación para:
 * 1. Inicializar y sincronizar el estado del usuario autenticado.
 * 2. Gestionar la persistencia bidireccional (Cookies y LocalStorage).
 * 3. Proveer métodos para iniciar sesión (`saveSession`) y cerrarla (`removeSession`).
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  /**
   * Recupera la sesión persistida al cargar o recargar la página.
   * Prioridad:
   * 1. Cookie `_REBACK_AUTH_KEY_` (compatible con SSR si aplicara).
   * 2. LocalStorage `_REBACK_AUTH_KEY_` (como respaldo si las cookies fallan o están bloqueadas).
   */
  const getSession = () => {
    try {
      // 1. Intentar obtener desde cookies
      const fetchedCookie = getCookie(authSessionKey)?.toString();
      if (fetchedCookie) return JSON.parse(fetchedCookie);

      // 2. Si no hay cookie, buscar en localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const fetchedLocal = localStorage.getItem(authSessionKey);
        if (fetchedLocal) return JSON.parse(fetchedLocal);
      }
    } catch (e) {
      console.error('Error al recuperar sesión:', e);
    }
    return undefined;
  };

  // Estado reactivo que almacena los datos de sesión del usuario logeado
  const [user, setUser] = useState(getSession);

  /**
   * Guarda y persiste la sesión tras un login exitoso.
   * @param {Object} userData - Datos devueltos por el backend (token, user, empresa)
   */
  const saveSession = (userData) => {
    try {
      // Guardar en cookie para persistencia y soporte de rutas
      setCookie(authSessionKey, JSON.stringify(userData), { path: '/' });

      // Guardar en localStorage como respaldo local
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(authSessionKey, JSON.stringify(userData));
      }
    } catch (e) {
      console.error('Error al guardar sesión:', e);
    }
    // Actualizar el estado de React para re-renderizar componentes dependientes
    setUser(userData);
  };

  /**
   * Elimina la sesión actual (Logout):
   * - Borra la cookie y la entrada de localStorage.
   * - Resetea el estado a `undefined`.
   * - Redirige automáticamente al usuario a la pantalla de login (`/auth/sign-in`).
   */
  const removeSession = () => {
    try {
      deleteCookie(authSessionKey, { path: '/' });
      deleteCookie(authSessionKey);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(authSessionKey);
      }
    } catch (e) {
      console.error('Error al borrar sesión:', e);
    }
    setUser(undefined);
    navigate('/auth/sign-in', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,                             // Objeto con { token, user, empresa } o undefined
        isAuthenticated: Boolean(user),   // Booleano: true si el usuario está autenticado
        saveSession,                      // Función para guardar sesión
        removeSession,                    // Función para cerrar sesión
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}