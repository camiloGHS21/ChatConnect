import { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import FullPageLoader from '@/components/FullPageLoader';
import productoService from '@/services/productoService';
import CatalogoProductsTable from './components/CatalogoProductsTable';

const CatalogoPage = () => {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const rawDb = await productoService.getProductos();
      setProductsList(Array.isArray(rawDb) ? rawDb.map(p => ({
        id: p.id,
        name: p.nombre,
        description: `${p.sku || ''} - ${p.marca || ''}`.trim().replace(/^-|-$/g, ''),
        category: { name: p.categoria || 'General' },
        subcategoria: p.subcategoria || '',
        referencia: p.referencia || '',
        fb_product_id: p.fb_product_id,
        meta_sync_status: p.meta_sync_status,
        price: Number(p.precio) || 0,
        quantity: Number(p.disponible ?? p.existencia) || 0,
        images: p.imagen_principal ? [p.imagen_principal] : [],
      })) : []);
    } catch (err) {
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCatalogData(); }, []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true); setFeedback(null);
    try {
      await productoService.eliminarProducto(productToDelete.id);
      setProductsList(prev => prev.filter(p => p.id !== productToDelete.id));
      setFeedback({ type: 'success', text: `"${productToDelete.name}" fue eliminado de la BD y de WhatsApp.` });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar producto';
      setFeedback({ type: 'danger', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setIsDeleting(false); setProductToDelete(null);
    }
  };

  const handleSyncMeta = async (prod) => {
    setIsSyncing(true); setFeedback(null);
    try {
      await productoService.syncMeta(prod.id);
      await fetchCatalogData();
      setFeedback({ type: 'success', text: `"${prod.name}" sincronizado con el catálogo de WhatsApp.` });
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Error al sincronizar con WhatsApp' });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return productsList;
    const term = searchTerm.toLowerCase();
    return productsList.filter(p =>
      [p.name, p.description, p.category?.name, p.subcategoria, p.referencia].some(v => v?.toLowerCase().includes(term))
    );
  }, [productsList, searchTerm]);

  return (
    <>
      <FullPageLoader
        show={isDeleting || isSyncing}
        title={isDeleting ? 'Eliminando producto...' : 'Sincronizando con Meta WhatsApp...'}
        message={isDeleting ? 'Eliminando de la base de datos y de WhatsApp...' : 'Actualizando catálogo en WhatsApp...'}
        badge="Meta WhatsApp Sync"
      />
      <PageMetaData title="Productos - Catálogo" />
      <PageBreadcrumb title="Productos" subName="Catálogo" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              {feedback && (
                <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)} className="mb-3 fs-13 py-2">
                  <IconifyIcon icon={feedback.type === 'success' ? 'bx:check-circle' : 'bx:error-circle'} className="me-1 fs-16 align-middle" />
                  {feedback.text}
                </Alert>
              )}
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div className="search-bar">
                  <span><IconifyIcon icon="bx:search-alt" className="mb-1" /></span>
                  <input
                    type="search" className="form-control" id="search"
                    placeholder="Buscar producto, referencia, categoría..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Link to="/catalogo/crear-producto" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" /> Crear Producto
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-2 fs-13">Cargando catálogo desde PostgreSQL...</p>
                </div>
              ) : productsList.length > 0 ? (
                <CatalogoProductsTable products={filteredProducts} onDeleteProduct={setProductToDelete} onSyncProduct={handleSyncMeta} />
              ) : (
                <div className="text-center py-5">
                  <IconifyIcon icon="bx:box" className="fs-48 text-muted mb-2" />
                  <h5 className="fw-semibold text-dark">No hay productos registrados</h5>
                  <p className="text-muted fs-13">Empieza creando un nuevo producto en tu catálogo.</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal
        show={!!productToDelete}
        onHide={() => !isDeleting && setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto de la base de datos y de WhatsApp?"
        message={`¿Estás seguro de que deseas eliminar "${productToDelete?.name}"? Esta acción lo retirará de PostgreSQL y del catálogo de WhatsApp Business.`}
        itemName={productToDelete?.name}
        confirmBtnText={isDeleting ? 'Eliminando...' : 'Sí, eliminar de WhatsApp y BD'}
      />
    </>
  );
};

export default CatalogoPage;
