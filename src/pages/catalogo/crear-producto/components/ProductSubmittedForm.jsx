import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Col, Row, Button, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductSubmittedForm = ({ productData, onCreateAnother }) => {
  return (
    <Row className="d-flex justify-content-center py-4">
      <Col lg={8} md={10}>
        <div className="text-center">
          <div className="avatar-lg bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '72px', height: '72px' }}>
            <IconifyIcon icon="bx:check-double" className="fs-36" />
          </div>
          <h3 className="mt-0 fw-bold text-dark">¡Producto Creado Exitosamente!</h3>
          <p className="mb-4 text-muted fs-14">
            El producto ha sido registrado exitosamente y está listo para comercializarse en la tienda y canales.
          </p>

          {productData && (
            <Card className="border shadow-none bg-light text-start mb-4">
              <Card.Body className="p-3">
                <Row className="g-2 fs-13">
                  <Col sm={6}>
                    <span className="text-muted">Código Interno:</span>{' '}
                    <strong className="font-monospace text-dark">{productData.codigo_interno || 'PRD-0001'}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Nombre:</span>{' '}
                    <strong className="text-dark">{productData.nombre || 'Producto'}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Precio con Impuesto:</span>{' '}
                    <strong className="text-success">${Number(productData.precio_impuesto || 0).toLocaleString('es-CO')}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Estado:</span>{' '}
                    <Badge bg="success" className="px-2">{productData.estado_producto || 'activo'}</Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-center gap-2">
            {onCreateAnother && (
              <Button variant="primary" onClick={onCreateAnother}>
                <IconifyIcon icon="bx:plus" className="me-1" />
                Crear Otro Producto
              </Button>
            )}
            <Link to="/catalogo" className="btn btn-outline-secondary">
              <IconifyIcon icon="bx:list-ul" className="me-1" />
              Ver Lista de Productos
            </Link>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ProductSubmittedForm;