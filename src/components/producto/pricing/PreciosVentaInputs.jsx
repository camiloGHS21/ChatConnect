import React from 'react';
import { Row, Col, Form, Button, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getCommercialRoundingSuggestions } from './pricingCalculations';

const PreciosVentaInputs = ({
  precioBase,
  precioImpuesto,
  onPrecioBaseChange,
  onPrecioImpuestoChange,
  onSmartRound
}) => {
  const suggestions = getCommercialRoundingSuggestions(precioImpuesto);

  return (
    <Row className="g-2 mb-3 align-items-start">
      <Col sm={6}>
        <Form.Group className="d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-between align-items-center mb-1" style={{ minHeight: '22px' }}>
            <Form.Label htmlFor="precio_base_input" className="mb-0 fs-13 fw-semibold text-dark text-truncate">
              Precio Base de Venta *
            </Form.Label>
            <Badge bg="secondary-subtle" className="text-secondary fs-10 border">Base</Badge>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-white text-muted fw-bold">$</span>
            <Form.Control
              id="precio_base_input"
              type="number"
              step="1"
              min="0"
              placeholder="145000"
              className="font-monospace fw-semibold text-dark text-end"
              value={precioBase ?? ''}
              onChange={e => onPrecioBaseChange(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-between align-items-center mt-1" style={{ minHeight: '26px' }}>
            <small className="text-muted fs-11">Calcula el precio final con impuestos</small>
            <span className="badge bg-light text-muted border fs-10">Directo</span>
          </div>
        </Form.Group>
      </Col>
      <Col sm={6}>
        <Form.Group className="d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-between align-items-center mb-1" style={{ minHeight: '22px' }}>
            <Form.Label htmlFor="precio_final_top" className="mb-0 fs-13 fw-semibold text-dark text-truncate">
              Precio Final con Impuestos
            </Form.Label>
            <Badge bg="success-subtle" className="text-success fs-10 border border-success border-opacity-25">Redondeo COP</Badge>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-white text-success fw-bold">$</span>
            <Form.Control
              id="precio_final_top"
              type="number"
              step="1"
              min="0"
              placeholder="172616"
              className="fw-bold text-success font-monospace text-end"
              value={precioImpuesto ?? ''}
              onChange={e => onPrecioImpuestoChange(e.target.value)}
              title="Al editarlo o redondearlo, descuenta impuestos de forma inversa"
            />
            <Button
              variant="success"
              type="button"
              className="text-white px-2 py-1 fs-12 fw-semibold d-flex align-items-center gap-1"
              title="Redondear a denominación COP"
              onClick={onSmartRound}
            >
              <IconifyIcon icon="bx:magic-wand" className="fs-15" />
              Redondear
            </Button>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-1 mt-1" style={{ minHeight: '26px' }}>
            <span className="text-muted fs-11 me-1">Sugerencias:</span>
            {suggestions.map((sug, i) => (
              <Badge
                key={i}
                bg="success-subtle"
                className="text-success border border-success border-opacity-25 cursor-pointer fs-11"
                style={{ cursor: 'pointer' }}
                onClick={() => onPrecioImpuestoChange(sug.value)}
                title={sug.desc}
              >
                {sug.label}
              </Badge>
            ))}
          </div>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default PreciosVentaInputs;
