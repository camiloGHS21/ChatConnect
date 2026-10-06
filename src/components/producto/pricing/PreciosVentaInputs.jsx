
import { Row, Col, Form, Badge } from 'react-bootstrap';

const PreciosVentaInputs = ({
  precioBase,
  onPrecioBaseChange,
}) => {
  return (
    <Row className="g-2 mb-3">
      <Col sm={12}>
        <Form.Group className="d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label htmlFor="precio_base_input" className="mb-0 fs-13 fw-semibold text-body-emphasis">
              Precio Base de Venta *
            </Form.Label>
            <Badge bg="secondary-subtle" className="text-secondary fs-10 border">Base</Badge>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-body text-muted fw-bold">$</span>
            <Form.Control
              id="precio_base_input"
              type="number"
              step="1"
              min="0"
              placeholder="145000"
              className="font-monospace fw-semibold text-body-emphasis text-end"
              value={precioBase ?? ''}
              onChange={e => onPrecioBaseChange(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-between align-items-center mt-1">
            <small className="text-muted fs-11">Neto antes de impuestos (el precio final con impuestos se calcula abajo)</small>
            <span className="badge bg-body-tertiary text-muted border fs-10">Directo</span>
          </div>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default PreciosVentaInputs;
