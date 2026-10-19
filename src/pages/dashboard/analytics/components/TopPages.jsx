import { Card, CardHeader, CardTitle, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Productos más cotizados, calculados en tiempo real a partir de las líneas
 * registradas en `public.pedido_detalle` con su disponibilidad en inventario.
 */
const TopPages = ({ productos = [] }) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="d-flex align-items-center justify-content-between gap-2 bg-transparent border-bottom">
        <div>
          <CardTitle as="h5" className="fw-bold mb-0">
            Productos Más Cotizados en WhatsApp
          </CardTitle>
          <span className="text-muted fs-12">Artículos con mayor demanda según las órdenes registradas</span>
        </div>
        <div>
          <Link to="/catalogo" className="btn btn-sm btn-outline-primary">
            Ver Catálogo
          </Link>
        </div>
      </CardHeader>
      <div className="table-responsive">
        <Table hover className="table-nowrap table-centered m-0 align-middle">
          <thead className="table-light">
            <tr className="fs-12 text-muted">
              <th>Producto y SKU</th>
              <th>Categoría</th>
              <th>Precio Unitario</th>
              <th>Unidades</th>
              <th>Existencias disponibles</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Aún no hay productos registrados en pedidos.
                </td>
              </tr>
            ) : (
              productos.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div className="fw-semibold text-dark">{prod.nombre}</div>
                    <span className="badge bg-light text-muted fs-11">{prod.sku}</span>
                  </td>
                  <td className="text-muted fs-12">{prod.categoria}</td>
                  <td className="fw-bold text-dark fs-12">{prod.precio}</td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary px-2 py-1">
                      {prod.unidades} und.
                    </span>
                    <div className="text-muted fs-11 mt-1">{prod.pedidos} pedidos</div>
                  </td>
                  <td>
                    <Badge bg={prod.disponible > 20 ? 'success-subtle' : 'danger-subtle'} className={prod.disponible > 20 ? 'text-success' : 'text-danger'}>
                      {prod.disponible} disponibles
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};

export default TopPages;
