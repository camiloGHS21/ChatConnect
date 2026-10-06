import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Col, Row, Button, Badge, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductSubmittedForm = ({ productData, onCreateAnother, isEditing }) => {
  return (
    <Row className="d-flex justify-content-center py-4">
      <Col lg={8} md={10}>
        <div className="text-center">
          <div className="avatar-lg bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '72px', height: '72px' }}>
            <IconifyIcon icon="bx:check-double" className="fs-36" />
          </div>
          <h3 className="mt-0 fw-bold text-body-emphasis">
            {isEditing ? '¡Producto Actualizado Exitosamente!' : '¡Producto Creado Exitosamente!'}
          </h3>
          <p className="mb-3 text-muted fs-14">
            {isEditing
              ? 'Los cambios han sido guardados en PostgreSQL y enviados al catálogo de WhatsApp (Meta).'
              : 'El producto ha sido registrado exitosamente en PostgreSQL y enviado al catálogo de WhatsApp.'}
          </p>

          {/* Banner de Transparencia y Experiencia de Usuario WhatsApp */}
          <Alert variant="info" className="text-start border-info-subtle bg-info-subtle p-3 mb-4 rounded-3">
            <div className="d-flex align-items-start gap-2">
              <IconifyIcon icon="bxl:whatsapp" className="fs-24 text-success flex-shrink-0 mt-1" />
              <div>
                <h6 className="fw-bold text-body-emphasis mb-1 d-flex align-items-center gap-2">
                  <span>Enviado al Catálogo de WhatsApp</span>
                  <Badge bg="success" className="fs-11">Sincronizado</Badge>
                </h6>
                <p className="fs-13 text-secondary mb-2">
                  Meta valida automáticamente las políticas de comercio e imágenes. Este proceso suele demorar entre <strong>2 y 10 minutos</strong>.
                </p>
                <div className="p-2 bg-body rounded border border-light-subtle fs-12 text-body-secondary">
                  💡 <strong>¿No lo ves en tu teléfono?</strong> WhatsApp móvil guarda el catálogo anterior en caché. <strong>Cierra la aplicación de WhatsApp</strong> (desde las aplicaciones recientes) y ábrela de nuevo para actualizarlo.
                </div>
              </div>
            </div>
          </Alert>

          {productData && (
            <Card className="border shadow-none bg-body-tertiary text-start mb-4">
              <Card.Body className="p-3">
                <Row className="g-2 fs-13">
                  <Col sm={6}>
                    <span className="text-muted">Código:</span>{' '}
                    <strong className="font-monospace text-body-emphasis">{productData.codigo_interno || 'PRD-0001'}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Nombre:</span>{' '}
                    <strong className="text-body-emphasis">{productData.nombre || 'Producto'}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Precio:</span>{' '}
                    <strong className="text-success">${Number(productData.precio_impuesto || 0).toLocaleString('es-CO')}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">WhatsApp Meta:</span>{' '}
                    <Badge bg="success" className="px-2">Enviado a Meta</Badge>
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