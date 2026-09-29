import { useState, useEffect } from 'react';
import productoService from '@/services/productoService';

export const useConfiguracion = () => {
  const [activeTab, setActiveTab] = useState('categorias');
  const [catalogs, setCatalogs] = useState({
    categorias: [],
    marcas: [],
    listasPrecios: [],
    impuestos: [],
    departamentos: [],
    ciudades: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await productoService.getConfiguraciones(1);
      setCatalogs(data);
    } catch (err) {
      console.error('Error cargando configuraciones:', err);
      setNotification({ type: 'danger', message: 'Error cargando catálogos de PostgreSQL' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const notify = (msg, type = 'success') => {
    setNotification({ type, message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const handleUpdateCat = async (id, nombre) => {
    try {
      setActionLoading(true);
      const updated = await productoService.actualizarCategoria(id, { nombre }, 1);
      setCatalogs(p => ({ ...p, categorias: p.categorias.map(c => c.id === id ? { ...c, nombre: updated.nombre } : c) }));
      notify(`Categoría actualizada a "${updated.nombre}"`);
    } catch (err) {
      notify(err.response?.data?.message || 'Error al actualizar categoría', 'danger');
    } finally { setActionLoading(false); }
  };

  const handleToggleCat = async (cat) => {
    const nextState = cat.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      await productoService.actualizarCategoria(cat.id, { estado: nextState }, 1);
      setCatalogs(p => ({ ...p, categorias: p.categorias.map(c => c.id === cat.id ? { ...c, estado: nextState } : c) }));
      notify(`Categoría "${cat.nombre}" marcada como ${nextState}`);
    } catch (err) { notify('Error al cambiar estado', 'danger'); }
  };

  const handleCreateCat = async (nombre) => {
    try {
      setActionLoading(true);
      const created = await productoService.crearCategoria({ nombre }, 1);
      setCatalogs(p => ({ ...p, categorias: [...p.categorias, created] }));
      notify(`Categoría "${nombre}" creada con éxito`);
    } catch (err) { notify(err.response?.data?.message || 'Error creando categoría', 'danger'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateMarca = async (id, nombre) => {
    try {
      setActionLoading(true);
      const updated = await productoService.actualizarMarca(id, { nombre }, 1);
      setCatalogs(p => ({ ...p, marcas: p.marcas.map(m => m.id === id ? { ...m, nombre: updated.nombre } : m) }));
      notify(`Marca actualizada a "${updated.nombre}"`);
    } catch (err) { notify(err.response?.data?.message || 'Error al actualizar marca', 'danger'); }
    finally { setActionLoading(false); }
  };

  const handleToggleMarca = async (marca) => {
    const nextState = marca.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      await productoService.actualizarMarca(marca.id, { estado: nextState }, 1);
      setCatalogs(p => ({ ...p, marcas: p.marcas.map(m => m.id === marca.id ? { ...m, estado: nextState } : m) }));
      notify(`Marca "${marca.nombre}" marcada como ${nextState}`);
    } catch (err) { notify('Error al cambiar estado', 'danger'); }
  };

  const handleCreateMarca = async (nombre) => {
    try {
      setActionLoading(true);
      const created = await productoService.crearMarca({ nombre }, 1);
      setCatalogs(p => ({ ...p, marcas: [...p.marcas, created] }));
      notify(`Marca "${nombre}" creada con éxito`);
    } catch (err) { notify(err.response?.data?.message || 'Error creando marca', 'danger'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateLista = async (id, nombre) => {
    try {
      setActionLoading(true);
      const updated = await productoService.actualizarListaPrecio(id, { nombre }, 1);
      setCatalogs(p => ({ ...p, listasPrecios: p.listasPrecios.map(l => l.id === id ? { ...l, nombre: updated.nombre } : l) }));
      notify(`Lista de precios actualizada a "${updated.nombre}"`);
    } catch (err) { notify(err.response?.data?.message || 'Error al actualizar lista', 'danger'); }
    finally { setActionLoading(false); }
  };

  const handleToggleLista = async (item) => {
    const nextState = item.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      await productoService.actualizarListaPrecio(item.id, { estado: nextState }, 1);
      setCatalogs(p => ({ ...p, listasPrecios: p.listasPrecios.map(l => l.id === item.id ? { ...l, estado: nextState } : l) }));
      notify(`Lista "${item.nombre}" marcada como ${nextState}`);
    } catch (err) { notify('Error al cambiar estado', 'danger'); }
  };

  const handleCreateLista = async (nombre) => {
    try {
      setActionLoading(true);
      const created = await productoService.crearListaPrecio({ nombre }, 1);
      setCatalogs(p => ({ ...p, listasPrecios: [...p.listasPrecios, created] }));
      notify(`Lista de precios "${nombre}" creada`);
    } catch (err) { notify(err.response?.data?.message || 'Error creando lista', 'danger'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateImpuesto = async (id, datos) => {
    try {
      setActionLoading(true);
      const updated = await productoService.actualizarImpuesto(id, datos, 1);
      setCatalogs(p => ({ ...p, impuestos: p.impuestos.map(i => i.id === id ? updated : i) }));
      notify(`Impuesto "${updated.nombre}" actualizado con éxito`);
    } catch (err) { notify(err.response?.data?.message || 'Error actualizando impuesto', 'danger'); }
    finally { setActionLoading(false); }
  };

  return {
    activeTab,
    setActiveTab,
    catalogs,
    loading,
    actionLoading,
    notification,
    setNotification,
    loadData,
    handleUpdateCat,
    handleToggleCat,
    handleCreateCat,
    handleUpdateMarca,
    handleToggleMarca,
    handleCreateMarca,
    handleUpdateLista,
    handleToggleLista,
    handleCreateLista,
    handleUpdateImpuesto,
  };
};
