import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

const authSessionKey = '_REBACK_AUTH_KEY_';

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const getSession = () => {
    try {
      const fetchedCookie = getCookie(authSessionKey)?.toString();
      if (fetchedCookie) return JSON.parse(fetchedCookie);
      if (typeof window !== 'undefined' && window.localStorage) {
        const fetchedLocal = localStorage.getItem(authSessionKey);
        if (fetchedLocal) return JSON.parse(fetchedLocal);
      }
    } catch (e) {
      console.error('Error al recuperar sesión:', e);
    }
    return undefined;
  };

  const [user, setUser] = useState(getSession);

  const saveSession = (userData) => {
    try {
      setCookie(authSessionKey, JSON.stringify(userData), { path: '/' });
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(authSessionKey, JSON.stringify(userData));
      }
    } catch (e) {
      console.error('Error al guardar sesión:', e);
    }
    setUser(userData);
  };

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
        user,
        isAuthenticated: Boolean(user),
        saveSession,
        removeSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}