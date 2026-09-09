import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './pages/sign-in/page';
import AnalyticsDashboard from './pages/dashboard/analytics/page';
import ClientesPage from './pages/clientes/page';
import CatalogoPage from './pages/catalogo/page';
import InventarioPage from './pages/inventario/page';
import PedidosPage from './pages/pedidos/page';
import ChatPage from './pages/chat/page';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper';
import { useAuthContext } from './context/useAuthContext';

function AppRoutes() {
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/auth/sign-in"
        element={
          !isAuthenticated ? (
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <AnalyticsDashboard />
            </AdminLayout>
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
      <Route
        path="/clientes"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <ClientesPage />
            </AdminLayout>
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
      <Route
        path="/catalogo"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <CatalogoPage />
            </AdminLayout>
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
      <Route
        path="/inventario"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <InventarioPage />
            </AdminLayout>
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
      <Route
        path="/pedidos"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <PedidosPage />
            </AdminLayout>
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <ChatPage />
            </AdminLayout>
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth/sign-in'} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppProvidersWrapper>
        <AppRoutes />
      </AppProvidersWrapper>
    </Router>
  );
}

export default App;
