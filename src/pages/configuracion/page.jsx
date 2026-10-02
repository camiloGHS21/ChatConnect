import React, { useState } from 'react';
import { Nav, Alert, Spinner } from 'react-bootstrap';
import PageMetaData from '@/components/PageTitle';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import productoService from '@/services/productoService';
import CategoriasConfigTab from './components/CategoriasConfigTab';
import MarcasConfigTab from './components/MarcasConfigTab';
import ListasPreciosConfigTab from './components/ListasPreciosConfigTab';
import ImpuestosConfigTab from './components/ImpuestosConfigTab';
import GeoConfigTab from './components/GeoConfigTab';
import { useConfiguracion } from './useConfiguracion';

const ConfiguracionPage = () => {
  const {
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

  return (
    <>
      <PageMetaData title="Configuración de Catálogos - ChatConnect" />
      <PageBreadcrumb title="Configuración de Catálogos" subName="Ajustes Maestros" />

      {notification.message && (
        <Alert variant={notification.type} className="py-2 fs-13 mb-3 d-flex align-items-center justify-content-between">
          <span>{notification.message}</span>
          <button type="button" className="btn-close fs-12" onClick={() => setNotification({ type: '', message: '' })} />
        </Alert>
      )}

      <Nav variant="pills" className="bg-light p-1 rounded-3 mb-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
        <Nav.Item><Nav.Link eventKey="categorias" className="fs-13 fw-semibold">Categorías</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="marcas" className="fs-13 fw-semibold">Marcas</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="listas" className="fs-13 fw-semibold">Listas de Precios</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="impuestos" className="fs-13 fw-semibold">Impuestos y Tasas</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="geo" className="fs-13 fw-semibold">Departamentos & Ciudades</Nav.Link></Nav.Item>
      </Nav>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {activeTab === 'categorias' && (
            <CategoriasConfigTab
              categorias={catalogs.categorias}
              onUpdateName={handleUpdateCat}
              onToggleStatus={handleToggleCat}
              onCreate={handleCreateCat}
              onDelete={cat => requestDelete('categoria', cat)}
              loading={actionLoading}
            />
          )}
          {activeTab === 'marcas' && (
            <MarcasConfigTab
              marcas={catalogs.marcas}
              onUpdateName={handleUpdateMarca}
              onToggleStatus={handleToggleMarca}
              onCreate={handleCreateMarca}
              onDelete={marca => requestDelete('marca', marca)}
              loading={actionLoading}
            />
          )}
          {activeTab === 'listas' && (
            <ListasPreciosConfigTab
              listasPrecios={catalogs.listasPrecios}
              onUpdateName={handleUpdateLista}
              onToggleStatus={handleToggleLista}
              onCreate={handleCreateLista}
              onDelete={lista => requestDelete('lista', lista)}
              loading={actionLoading}
            />
          )}
          {activeTab === 'impuestos' && (
            <ImpuestosConfigTab
              impuestos={catalogs.impuestos}
              onUpdateImpuesto={handleUpdateImpuesto}
              loading={actionLoading}
            />
          )}
          {activeTab === 'geo' && (
            <GeoConfigTab
              departamentos={catalogs.departamentos}
              ciudades={catalogs.ciudades}
              onCrearDepartamento={async (d) => { await productoService.crearDepartamento(d); loadData(); }}
              onCrearCiudad={async (c) => { await productoService.crearCiudad(c); loadData(); }}
              loading={actionLoading}
            />
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
