import { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';
import CatalogoProductsTable from './components/CatalogoProductsTable';

const CatalogoPage = () => {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rawDb = await productoService.getProductos();
        if (Array.isArray(rawDb)) {
          const mapped = rawDb.map((p) => ({
            id: p.id,
            name: p.nombre,
            description: `${p.sku || ''} - ${p.marca || ''}`.trim().replace(/^-|-$/g, ''),
            category: { name: p.categoria || 'General' },
            price: Number(p.precio) || 0,
            quantity: Number(p.disponible ?? p.existencia) || 0,
            images: p.imagen_principal ? [p.imagen_principal] : [],
          }));
          setProductsList(mapped);
        } else {
          setProductsList([]);
        }
      } catch (err) {
        console.error('Error al cargar productos desde PostgreSQL:', err);
        setProductsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return productsList;
    const term = searchTerm.toLowerCase();
    return productsList.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.name?.toLowerCase().includes(term)
    );
  }, [productsList, searchTerm]);

  return (
    <>
      <PageMetaData title="Productos - Catálogo" />
      <PageBreadcrumb title="Productos" subName="Catálogo" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    id="search"
                    placeholder="Search ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Link
                    to="/catalogo/crear-producto"
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Crear Producto
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
                <CatalogoProductsTable products={filteredProducts} />
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
    </>
  );
};

export default CatalogoPage;
