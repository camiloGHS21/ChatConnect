
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Formulario superior para seleccionar y configurar una lista de precios antes de agregarla.
 * Idéntico al diseño de la imagen del usuario (media_1790108944931.png).
 */
const ListasPreciosForm = ({
  allPriceLists = [],
  newPriceList,
  isListAlreadyAdded,
  onListChange,
  onPriceBaseChange,
  onUtilidadChange,
  onPrecioVentaChange,
  onAddPriceList,
  onOpenCreateList
}) => {
  const handleSelectChange = (val) => {
    if (val === 'CREATE_NEW') {
      if (onOpenCreateList) onOpenCreateList();
      return;
    }
    onListChange(val);
  };

  return (
    <Card
      className="border shadow-none mb-3 bg-body rounded-3"
      style={{ borderColor: 'var(--bs-border-color)' }}
    >
      <Card.Body className="p-3 px-3 px-md-4">
        <Row className="g-3 align-items-end">
          {/* Seleccionar Lista */}
          <Col lg={3} md={6} xs={12}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <Form.Label className="fs-13 fw-semibold text-secondary mb-0">
                Seleccionar Lista
              </Form.Label>
              {onOpenCreateList && (
                <button
                  type="button"
                  className="btn btn-link p-0 fs-12 text-primary fw-semibold text-decoration-none"
                  onClick={onOpenCreateList}
                >
                  + Crear Lista
                </button>
              )}
            </div>
            <Form.Select
              value={newPriceList.lista_precio_id}
              isInvalid={isListAlreadyAdded}
              onChange={e => handleSelectChange(e.target.value)}
              style={{ borderRadius: '6px' }}
            >
              <option value="" disabled>
                {allPriceLists.length > 0 ? 'Selecciona una lista...' : 'No hay listas disponibles'}
              </option>
              {allPriceLists.map(lp => (
                <option key={lp.id} value={lp.id} disabled={lp.isAssigned}>
                  {lp.nombre} {lp.isAssigned ? '— (Ya agregada)' : ''}
                </option>
              ))}
              <option value="CREATE_NEW" className="fw-bold text-primary">
                + Crear nueva lista de precios...
              </option>
            </Form.Select>
            {isListAlreadyAdded && (
              <div className="text-danger fs-11 mt-1 d-flex align-items-center">
                <IconifyIcon icon="bx:error-circle" className="me-1 fs-12" />
                Esta lista ya está cargada
              </div>
            )}
          </Col>

          {/* Precio Base ($) */}
          <Col lg={2} md={3} xs={6}>
            <Form.Label className="fs-13 fw-semibold text-secondary mb-1">
              Precio Base ($)
            </Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="any"
              placeholder="145000"
              value={newPriceList.precio_base ?? ''}
              onChange={e => onPriceBaseChange(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </Col>

          {/* % Utilidad */}
          <Col lg={2} md={3} xs={6}>
            <Form.Label className="fs-13 fw-semibold text-secondary mb-1">
              % Utilidad
            </Form.Label>
            <Form.Control
              type="number"
              step="any"
              placeholder="70.59"
              value={newPriceList.utilidad_porcentaje ?? ''}
              onChange={e => onUtilidadChange(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </Col>

          {/* Precio Venta Final ($) */}
          <Col lg={3} md={6} xs={6}>
            <Form.Label className="fs-13 fw-semibold text-secondary mb-1">
              Precio Venta Final ($)
            </Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="any"
              placeholder="172550"
              value={newPriceList.precio_venta ?? ''}
              onChange={e => onPrecioVentaChange(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </Col>

          {/* Botón Agregar Lista */}
          <Col lg={2} md={6} xs={6}>
            <Button
              variant={isListAlreadyAdded ? 'secondary' : 'primary'}
              className="w-100 fw-medium d-flex align-items-center justify-content-center"
              style={{
                height: '38px',
                borderRadius: '6px',
                backgroundColor: isListAlreadyAdded ? undefined : '#0d6efd',
                borderColor: isListAlreadyAdded ? undefined : '#0d6efd'
              }}
              onClick={onAddPriceList}
              disabled={isListAlreadyAdded || !newPriceList.lista_precio_id || newPriceList.lista_precio_id === 'CREATE_NEW'}
            >
              + Agregar Lista
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ListasPreciosForm;
