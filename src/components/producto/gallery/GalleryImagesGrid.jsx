import React from 'react';
import { Row, Col, Card, Badge, Button, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Cuadrícula de imágenes cargadas en la galería del producto.
 * Idéntico al template Reback y a la captura de pantalla oficial.
 */
const GalleryImagesGrid = ({
  imagenes = [],
  onSetPrincipal,
  onRemoveImage,
  onUpdateOrder,
  triggerDeleteConfirm,
}) => {
  const handleDelete = (img) => {
    if (triggerDeleteConfirm) {
      triggerDeleteConfirm({
        title: '¿Eliminar imagen de la galería?',
        itemName: img.nombre || 'Imagen del producto',
        itemType: 'imagen',
        onConfirm: () => onRemoveImage(img.id),
      });
    } else {
      onRemoveImage(img.id);
    }
  };

  return (
    <div className="mb-3">
      <h6 className="fw-bold text-dark mb-2">
        Imágenes Cargadas en la Galería ({imagenes.length})
      </h6>
      <Row className="g-3 mb-4">
        {imagenes.length === 0 ? (
          <Col lg={12}>
            <div className="text-center py-4 text-muted fs-13 border rounded bg-light-subtle">
              <IconifyIcon icon="bx:image" className="fs-32 text-muted mb-2 d-block mx-auto" />
              No se han agregado imágenes al producto todavía. Utiliza el Dropzone superior para añadir fotos.
            </div>
          </Col>
        ) : (
          imagenes.map((img) => (
            <Col xl={3} lg={4} sm={6} key={img.id}>
              <Card className={`border shadow-none h-100 ${img.principal ? 'border-primary border-2' : ''}`}>
                <div className="position-relative bg-light rounded-top text-center p-2" style={{ height: '160px' }}>
                  <img
                    src={img.url}
                    alt={img.nombre}
                    className="img-fluid rounded"
                    style={{ maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/src/assets/images/products/product-1(1).png';
                    }}
                  />
                  {img.principal && (
                    <Badge bg="primary" className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-11 shadow-sm">
                      <IconifyIcon icon="bx:star" className="me-1" />
                      Principal
                    </Badge>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2 p-1 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '26px', height: '26px' }}
                    onClick={() => handleDelete(img)}
                    title="Eliminar imagen"
                  >
                    <IconifyIcon icon="bx:x" className="fs-16" />
                  </Button>
                </div>

                <Card.Body className="p-2">
                  <p className="fw-semibold text-truncate mb-1 fs-12 text-dark" title={img.nombre}>
                    {img.nombre}
                  </p>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted fs-11">{img.tamano || '142 KB'}</span>
                    <div className="d-flex align-items-center gap-1">
                      <span className="fs-11 text-muted">Orden:</span>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="1"
                        style={{ width: '50px', height: '24px', fontSize: '11px', padding: '2px 4px' }}
                        value={img.orden || 1}
                        onChange={e => onUpdateOrder(img.id, e.target.value)}
                      />
                    </div>
                  </div>

                  {!img.principal ? (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 fs-11 py-1"
                      onClick={() => onSetPrincipal(img.id)}
                    >
                      <IconifyIcon icon="bx:star" className="me-1" />
                      Marcar como Principal
                    </Button>
                  ) : (
                    <div className="text-center text-success fs-11 fw-semibold py-1 bg-success-subtle rounded">
                      <IconifyIcon icon="bx:check" className="me-1" />
                      Foto de Portada
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default GalleryImagesGrid;
