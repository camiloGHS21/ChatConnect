import { useRef, useState } from 'react';
import productoService from '@/services/productoService';

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const useRetencionesConfig = ({ retenciones = [], setCatalogs }) => {
  const [search, setSearch] = useState('');
  const [grupo, setGrupo] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const updating = useRef(false);
  const items = Array.isArray(retenciones) ? retenciones : [];
  const grupos = [...new Set(items.map(item => item.grupo).filter(Boolean))].sort();
  const query = normalize(search.trim());
  const filtered = items.filter(item => (!grupo || item.grupo === grupo) &&
    [item.nombre, item.codigo, item.grupo, item.tipo, item.condicion, item.norma]
      .some(value => normalize(value).includes(query)));

  const onToggleStatus = async (item) => {
    if (updating.current) return false;
    const estado = item.estado === 'activo' ? 'inactivo' : 'activo';
    updating.current = true;
    setUpdatingId(item.id);
    setNotification(null);
    try {
      const updated = await productoService.actualizarRetencion(item.id, { estado }, 1);
      const persisted = updated?.estado ?? estado;
      setCatalogs(previous => ({
        ...previous,
        retenciones: (previous.retenciones || []).map(row => row.id === item.id ? { ...row, estado: persisted } : row),
      }));
      setNotification({ type: 'success', message: `Retención "${item.nombre}" marcada como ${persisted}.` });
      return true;
    } catch (error) {
      const message = error.response?.data?.message;
      setNotification({
        type: 'danger',
        message: (Array.isArray(message) ? message.join('. ') : message) || 'No se pudo actualizar la retención. Intenta de nuevo.',
      });
      return false;
    } finally {
      updating.current = false;
      setUpdatingId(null);
    }
  };

  return {
    filtered, grupos, search, setSearch, grupo, setGrupo, updatingId, notification, onToggleStatus,
    total: items.length,
  };
};
