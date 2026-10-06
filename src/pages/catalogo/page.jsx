import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardBody, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import FullPageLoader from '@/components/FullPageLoader';
import productoService from '@/services/productoService';
import CatalogoProductsTable from './components/CatalogoProductsTable';
import SeedFerreteriBtn from './components/SeedFerreteriBtn';
import DeleteAllProductsBtn from './components/DeleteAllProductsBtn';
import WhatsAppCatalogInfoBanner from './components/WhatsAppCatalogInfoBanner';

const CatalogoPage = () => {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCatalogData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const rawDb = await productoService.getProductos();
      if (signal?.aborted) return;
      setProductsList(Array.isArray(rawDb) ? rawDb.map(p => ({
        id: p.id, name: p.nombre,
        description: `${p.sku || ''} - ${p.marca || ''}`.trim().replace(/^-|-$/g, ''),
        category: { name: p.categoria || 'General' },
        subcategoria: p.subcategoria || '', referencia: p.referencia || '',
        fb_product_id: p.fb_product_id, meta_sync_status: p.meta_sync_status,
        price: Number(p.precio) || 0, quantity: Number(p.disponible ?? p.existencia) || 0,
        images: p.imagen_principal ? [p.imagen_principal] : [],
      })) : []);
    } catch { if (!signal?.aborted) setProductsList([]); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalogData(controller.signal);
    return () => controller.abort();
  }, [fetchCatalogData]);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true); setFeedback(null);
    try {
      await productoService.eliminarProducto(productToDelete.id);
      setProductsList(prev => prev.filter(p => p.id !== productToDelete.id));
      setFeedback({ type: 'success', text: `"${productToDelete.name}" eliminado.` });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error';
      setFeedback({ type: 'danger', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally { setIsDeleting(false); setProductToDelete(null); }
  };

  const handleSyncMeta = async (prod) => {
    setIsSyncing(true); setFeedback(null);
    try {
      await productoService.syncMeta(prod.id);
      await fetchCatalogData();
      setFeedback({ type: 'success', text: `"${prod.name}" sincronizado con Meta WhatsApp.` });
    } catch { setFeedback({ type: 'danger', text: 'Error al sincronizar con WhatsApp' }); }
    finally { setIsSyncing(false); }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return productsList;
    const t = searchTerm.toLowerCase();
    return productsList.filter(p => [p.name, p.description, p.category?.name, p.subcategoria, p.referencia].some(v => v?.toLowerCase().includes(t)));
  }, [productsList, searchTerm]);

  return (
    <>
      <FullPageLoader show={isDeleting || isSyncing || isSeeding || isDeletingAll}
        title={isSeeding ? 'Sincronizando...' : isDeletingAll ? 'Vaciando...' : 'Procesando...'}
        message={isSeeding ? 'Cargando productos de demostración en PostgreSQL y Meta...' : ''} badge="PostgreSQL" />
      <PageMetaData title="Productos - Catálogo" />
      <PageBreadcrumb title="Catálogo de Productos" subName="Meta Commerce y WhatsApp" />

      <Row><Col><Card><CardBody>
        <WhatsAppCatalogInfoBanner />
        {feedback && (
          <Alert variant={feedback.type} dismissible closeLabel="Cerrar aviso" onClose={() => setFeedback(null)} className="mb-3 fs-13 py-2">
            <IconifyIcon icon={feedback.type === 'success' ? 'bx:check-circle' : 'bx:error-circle'} className="me-1 fs-16 align-middle" />
            {feedback.text}
          </Alert>
        )}
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
          <div className="search-bar">
            <span><IconifyIcon icon="bx:search-alt" className="mb-1" /></span>
            <input type="search" className="form-control" placeholder="Buscar producto..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="d-flex gap-2">
            <DeleteAllProductsBtn disabled={productsList.length === 0} onLoadingChange={setIsDeletingAll}
              onComplete={(res) => { fetchCatalogData(); setFeedback({ type: 'success', text: res.message }); }}
              onError={(msg) => setFeedback({ type: 'danger', text: msg })} />
            <SeedFerreteriBtn onLoadingChange={setIsSeeding}
              onComplete={(res) => { fetchCatalogData(); setFeedback({ type: 'success', text: res.message }); }}
              onError={(msg) => setFeedback({ type: 'danger', text: msg })} />
            <Link to="/catalogo/crear-producto" className="btn btn-primary d-flex align-items-center">
              <IconifyIcon icon="bx:plus" className="me-1" /> Crear Producto
            </Link>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="text-muted mt-2 fs-13">Cargando...</p></div>
        ) : productsList.length > 0 ? (
          <CatalogoProductsTable products={filteredProducts} onDeleteProduct={setProductToDelete} onSyncProduct={handleSyncMeta} />
        ) : (
          <div className="text-center py-5"><IconifyIcon icon="bx:box" className="fs-48 text-muted mb-2" /><h5 className="fw-semibold">No hay productos</h5></div>
        )}
      </CardBody></Card></Col></Row>

      <DeleteConfirmationModal show={!!productToDelete} onHide={() => !isDeleting && setProductToDelete(null)}
        onConfirm={handleConfirmDelete} title="¿Eliminar producto?" message={`¿Eliminar "${productToDelete?.name}" de BD y WhatsApp?`}
        itemName={productToDelete?.name} confirmBtnText={isDeleting ? 'Eliminando...' : 'Sí, eliminar'} />
    </>
  );
};

export default CatalogoPage;
