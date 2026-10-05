import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productoService from '@/services/productoService';

const TAB_TO_MENU = {
  categorias: 'inventario',
  marcas: 'inventario',
  listas: 'precios',
  impuestos: 'precios',
  geo: 'geo',
  ciudades: 'geo',
};

const MENU_DEFAULT_TAB = {
  inventario: 'categorias',
  precios: 'listas',
  geo: 'geo',
};

export const useConfiguracion = () => {
  const { seccion, tab } = useParams();
  const navigate = useNavigate();

  let resolvedMenu = 'inventario';
  let resolvedTab = 'categorias';

  if (seccion) {
    if (MENU_DEFAULT_TAB[seccion]) {
      resolvedMenu = seccion;
      resolvedTab = tab || MENU_DEFAULT_TAB[seccion];
      if (resolvedTab === 'ciudades') resolvedTab = 'geo';
    } else if (TAB_TO_MENU[seccion]) {
      resolvedTab = seccion === 'ciudades' ? 'geo' : seccion;
      resolvedMenu = TAB_TO_MENU[resolvedTab];
    }
  }

  const [activeMenu, setActiveMenu] = useState(resolvedMenu);
  const [activeTab, setActiveTab] = useState(resolvedTab);

  useEffect(() => {
    setActiveMenu(resolvedMenu);
    setActiveTab(resolvedTab);
  }, [resolvedMenu, resolvedTab]);

  const handleSelectMenu = (menuKey, defaultTabKey) => {
    const nextTab = defaultTabKey || MENU_DEFAULT_TAB[menuKey] || 'categorias';
    setActiveMenu(menuKey);
    setActiveTab(nextTab);
    navigate(`/configuracion/${menuKey}/${nextTab}`);
  };

  const handleSelectTab = (tabKey) => {
    const nextTab = tabKey === 'ciudades' ? 'geo' : tabKey;
    const parentMenu = TAB_TO_MENU[nextTab] || activeMenu;
    setActiveMenu(parentMenu);
    setActiveTab(nextTab);
    navigate(`/configuracion/${parentMenu}/${nextTab}`);
  };

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

  const handleDeleteCat = async (cat) => {
    if (cat.total_productos > 0) {
      notify(`No se puede eliminar "${cat.nombre}" porque tiene ${cat.total_productos} producto(s) asociado(s).`, 'warning');
      return false;
    }
    try {
      setActionLoading(true);
      await productoService.eliminarCategoria(cat.id, 1);
      setCatalogs(p => ({ ...p, categorias: p.categorias.filter(c => c.id !== cat.id) }));
      notify(`Categoría "${cat.nombre}" eliminada exitosamente`);
      return true;
    } catch (err) {
      notify(err.response?.data?.message || 'Error al eliminar categoría', 'danger');
      return false;
    } finally { setActionLoading(false); }
  };

  const handleDeleteMarca = async (marca) => {
    if (marca.total_productos > 0) {
      notify(`No se puede eliminar "${marca.nombre}" porque tiene ${marca.total_productos} producto(s) asociado(s).`, 'warning');
      return false;
    }
    try {
      setActionLoading(true);
      await productoService.eliminarMarca(marca.id, 1);
      setCatalogs(p => ({ ...p, marcas: p.marcas.filter(m => m.id !== marca.id) }));
      notify(`Marca "${marca.nombre}" eliminada exitosamente`);
      return true;
    } catch (err) {
      notify(err.response?.data?.message || 'Error al eliminar marca', 'danger');
      return false;
    } finally { setActionLoading(false); }
  };

  const handleDeleteLista = async (lista) => {
    if (lista.total_productos > 0) {
      notify(`No se puede eliminar "${lista.nombre}" porque tiene ${lista.total_productos} producto(s) asociado(s).`, 'warning');
      return false;
    }
    try {
      setActionLoading(true);
      await productoService.eliminarListaPrecio(lista.id, 1);
      setCatalogs(p => ({ ...p, listasPrecios: p.listasPrecios.filter(l => l.id !== lista.id) }));
      notify(`Lista de precios "${lista.nombre}" eliminada exitosamente`);
      return true;
    } catch (err) {
      notify(err.response?.data?.message || 'Error al eliminar lista', 'danger');
      return false;
    } finally { setActionLoading(false); }
  };

  return {
    activeMenu,
    activeTab,
    setActiveTab,
    handleSelectMenu,
    handleSelectTab,
    catalogs,
    loading,
    actionLoading,
    notification,
    setNotification,
    loadData,
    handleUpdateCat,
    handleToggleCat,
    handleCreateCat,
    handleDeleteCat,
    handleUpdateMarca,
    handleToggleMarca,
    handleCreateMarca,
    handleDeleteMarca,
    handleUpdateLista,
    handleToggleLista,
    handleCreateLista,
    handleDeleteLista,
    handleUpdateImpuesto,
  };
};
