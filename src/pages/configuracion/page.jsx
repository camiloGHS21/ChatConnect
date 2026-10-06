import { useState } from 'react';
import { Nav, Alert, Spinner, Badge } from 'react-bootstrap';
import PageMetaData from '@/components/PageTitle';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';
import CategoriasConfigTab from './components/CategoriasConfigTab';
import MarcasConfigTab from './components/MarcasConfigTab';
import ListasPreciosConfigTab from './components/ListasPreciosConfigTab';
import ImpuestosConfigTab from './components/ImpuestosConfigTab';
import GeoConfigTab from './components/GeoConfigTab';
import LimpiezaDatosTab from './components/LimpiezaDatosTab';
import { useConfiguracion } from './useConfiguracion';

const SECTION_CONFIG = {
  inventario: {
    title: 'Configuración de Inventario',
    subName: 'Categorías y Marcas',
    tabs: [
      { key: 'categorias', label: 'Categorías', icon: 'bx:category', countKey: 'categorias' },
      { key: 'marcas', label: 'Marcas', icon: 'bx:purchase-tag', countKey: 'marcas' },
    ],
  },
  precios: {
    title: 'Configuración de Precios e Impuestos',
    subName: 'Listas de Precios y Tasas',
    tabs: [
      { key: 'listas', label: 'Listas de Precios', icon: 'bx:list-ul', countKey: 'listasPrecios' },
      { key: 'impuestos', label: 'Impuestos y Tasas', icon: 'bx:receipt', countKey: 'impuestos' },
    ],
  },
  geo: {
    title: 'Código de Ciudades',
    subName: 'Configuraciones de Ciudades',
    tabs: [
      { key: 'geo', label: 'Ciudades', icon: 'bx:map-pin', countKey: 'departamentos' },
    ],
  },
  limpieza: {
    title: 'Limpieza y Purga de Datos',
    subName: 'Zona de Seguridad y Vaciado de Empresa',
    tabs: [
      { key: 'limpieza', label: 'Purga de Datos', icon: 'bx:trash-alt', countKey: 'limpieza' },
    ],
  },
};

const ConfiguracionPage = () => {
  const {
    activeMenu,
    activeTab,
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
  } = useConfiguracion();

  const [itemToDelete, setItemToDelete] = useState(null);

  const requestDelete = (type, item) => {
    if (item.total_productos > 0) {
      setNotification({
        type: 'warning',
        message: `No se puede eliminar "${item.nombre}" porque tiene ${item.total_productos} producto(s) asociado(s).`,
      });
      return;
    }
    setItemToDelete({ type, item });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, item } = itemToDelete;
    if (type === 'categoria') await handleDeleteCat(item);
    else if (type === 'marca') await handleDeleteMarca(item);
    else if (type === 'lista') await handleDeleteLista(item);
    setItemToDelete(null);
  };

  const currentSection = SECTION_CONFIG[activeMenu] || SECTION_CONFIG.inventario;

  return (
    <>
      <PageMetaData title={`${currentSection.title} - ChatConnect`} />
      <PageBreadcrumb title={currentSection.title} subName={currentSection.subName} />

      {notification.message && (
        <Alert variant={notification.type} className="py-2 fs-13 mb-3 d-flex align-items-center justify-content-between">
          <span>{notification.message}</span>
          <button type="button" className="btn-close fs-12" aria-label="Cerrar aviso" onClick={() => setNotification({ type: '', message: '' })} />
        </Alert>
      )}

      {/* Pestañas exclusivas de la sección actual (Inventario o Precios o Geo) */}
      {currentSection.tabs.length > 1 && (
        <Nav
          variant="pills"
          className="bg-light p-1 rounded-3 mb-3 d-inline-flex"
          activeKey={activeTab}
          onSelect={k => k && handleSelectTab(k)}
        >
          {currentSection.tabs.map(tab => {
            const count = catalogs[tab.countKey]?.length || 0;
            return (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key} className="fs-13 fw-semibold d-flex align-items-center gap-2">
                  <IconifyIcon icon={tab.icon} className="fs-16" />
                  <span>{tab.label}</span>
                  <Badge
                    bg={activeTab === tab.key ? 'primary' : 'secondary-subtle'}
                    className={`fs-11 ${activeTab === tab.key ? 'text-white' : 'text-secondary'}`}
                  >
                    {count}
                  </Badge>
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {activeMenu === 'inventario' && activeTab === 'categorias' && (
            <CategoriasConfigTab
              categorias={catalogs.categorias}
              onUpdateName={handleUpdateCat}
              onToggleStatus={handleToggleCat}
              onCreate={handleCreateCat}
              onDelete={cat => requestDelete('categoria', cat)}
              loading={actionLoading}
            />
          )}
          {activeMenu === 'inventario' && activeTab === 'marcas' && (
            <MarcasConfigTab
              marcas={catalogs.marcas}
              onUpdateName={handleUpdateMarca}
              onToggleStatus={handleToggleMarca}
              onCreate={handleCreateMarca}
              onDelete={marca => requestDelete('marca', marca)}
              loading={actionLoading}
            />
          )}
          {activeMenu === 'precios' && activeTab === 'listas' && (
            <ListasPreciosConfigTab
              listasPrecios={catalogs.listasPrecios}
              onUpdateName={handleUpdateLista}
              onToggleStatus={handleToggleLista}
              onCreate={handleCreateLista}
              onDelete={lista => requestDelete('lista', lista)}
              loading={actionLoading}
            />
          )}
          {activeMenu === 'precios' && activeTab === 'impuestos' && (
            <ImpuestosConfigTab
              impuestos={catalogs.impuestos}
              onUpdateImpuesto={handleUpdateImpuesto}
              loading={actionLoading}
            />
          )}
          {activeMenu === 'geo' && (
            <GeoConfigTab
              departamentos={catalogs.departamentos}
              ciudades={catalogs.ciudades}
              onCrearDepartamento={async (d) => { await productoService.crearDepartamento(d); loadData(); }}
              onCrearCiudad={async (c) => { await productoService.crearCiudad(c); loadData(); }}
              loading={actionLoading}
            />
          )}
          {activeMenu === 'limpieza' && (
            <LimpiezaDatosTab onDataPurged={loadData} />
          )}
        </>
      )}

      <DeleteConfirmationModal
        show={Boolean(itemToDelete)}
        onHide={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`¿Eliminar ${itemToDelete?.type === 'categoria' ? 'categoría' : itemToDelete?.type === 'marca' ? 'marca' : 'lista de precios'}?`}
        itemName={itemToDelete?.item?.nombre}
        itemType={itemToDelete?.type === 'categoria' ? 'categoría' : itemToDelete?.type === 'marca' ? 'marca' : 'lista de precios'}
        confirmBtnText={actionLoading ? 'Eliminando...' : 'Sí, eliminar'}
      />
    </>
  );
};

export default ConfiguracionPage;
