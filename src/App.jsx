import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './pages/sign-in/page';
import AnalyticsDashboard from './pages/dashboard/analytics/page';
import ClientesPage from './pages/clientes/page';
import CreateProduct from './pages/catalogo/crear-producto/page';
import CatalogoPage from './pages/catalogo/page';
import InventarioPage from './pages/inventario/page';
import PedidosPage from './pages/pedidos/page';
import ChatPage from './pages/chat/page';
import ConfiguracionPage from './pages/configuracion/page';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper';
import { useAuthContext } from './context/useAuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/auth/sign-in" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

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
      <Route path="/dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
      <Route path="/catalogo" element={<ProtectedRoute><CatalogoPage /></ProtectedRoute>} />
      <Route path="/ecommerce/products" element={<ProtectedRoute><CatalogoPage /></ProtectedRoute>} />
      <Route path="/catalogo/crear-producto" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
      <Route path="/ecommerce/products/create" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
      <Route path="/inventario" element={<ProtectedRoute><InventarioPage /></ProtectedRoute>} />
      <Route path="/pedidos" element={<ProtectedRoute><PedidosPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth/sign-in'} replace />} />
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
