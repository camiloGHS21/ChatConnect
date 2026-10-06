import { useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import { AuthProvider } from '@/context/useAuthContext';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';
const SpanishToastContainer = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    // Toastify 10 tiene estas etiquetas internas sin una API de localización.
    const translateLabels = () => {
      container.querySelectorAll('[aria-label="close"]').forEach(button => {
        button.setAttribute('aria-label', 'Cerrar notificación');
      });
      container.querySelectorAll('[aria-label="notification timer"]').forEach(timer => {
        timer.setAttribute('aria-label', 'Tiempo restante de la notificación');
      });
    };
    translateLabels();
    const observer = new MutationObserver(translateLabels);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return <div ref={containerRef}><ToastContainer theme="colored" /></div>;
};
const handleChangeTitle = () => {
  if (document.visibilityState === 'hidden') {
    document.title = 'Vuelve pronto 🥺';
  } else {
    document.title = DEFAULT_PAGE_TITLE;
  }
};
const AppProvidersWrapper = ({
  children
}) => {
  useEffect(() => {
    document.addEventListener('visibilitychange', handleChangeTitle);
    return () => {
      document.removeEventListener('visibilitychange', handleChangeTitle);
    };
  }, []);
  return <AuthProvider>
    <LayoutProvider>
      <NotificationProvider>
        {children}
        <SpanishToastContainer />
      </NotificationProvider>
    </LayoutProvider>
  </AuthProvider>;
};
export default AppProvidersWrapper;