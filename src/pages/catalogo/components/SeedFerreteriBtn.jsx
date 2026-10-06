import { useState } from 'react';
import { Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';

/**
 * Botón que ejecuta el seed integral de ferretería (48 productos demo).
 * Muestra feedback al padre vía onComplete / onError callbacks.
 */
const SeedFerreteriBtn = ({ onComplete, onError, onLoadingChange }) => {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    onLoadingChange?.(true);
    try {
      const res = await productoService.seedFerreteria();
      onComplete?.(res);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar los productos de demostración';
      onError?.(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <Button variant="warning" className="d-flex align-items-center" onClick={handleSeed} disabled={loading}>
      <IconifyIcon icon={loading ? 'bx:loader-alt' : 'bx:data'} className={`me-1 ${loading ? 'bx-spin' : ''}`} />
      {loading ? 'Cargando y Sincronizando...' : 'Cargar productos de demostración'}
    </Button>
  );
};

export default SeedFerreteriBtn;
