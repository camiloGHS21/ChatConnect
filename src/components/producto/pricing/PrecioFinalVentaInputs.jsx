import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  calculateGrossUtilityMargin,
  calculatePriceByGrossUtilityMargin,
} from './pricingCalculations';

const PrecioFinalVentaInputs = ({ costoBase, precioFinal, costoFinal, onPrecioFinalChange, onSmartRound }) => {
  const [marginDraft, setMarginDraft] = useState(null);
  const base = Number(costoBase) || 0;
  const costo = Number(costoFinal) || 0;
  const margen = Math.round(calculateGrossUtilityMargin(base, costo, precioFinal) * 100) / 100;

  const handleMarginChange = (value) => {
    setMarginDraft(value);
    if (value === '' || !Number.isFinite(Number(value))) return;
    onPrecioFinalChange(calculatePriceByGrossUtilityMargin(base, costo, value));
  };

  return (
    <Row className="g-2 align-items-start">
      <Col md={4}>
        <Form.Group controlId="margen_final_input">
          <Form.Label className="fw-bold fs-13 text-body-emphasis mb-1">Margen de Utilidad Final</Form.Label>
          <div className="input-group w-100">
            <Form.Control
              type="number"
              min="-100"
              step="0.01"
              className="text-end fw-bold font-monospace"
              value={marginDraft ?? margen}
              onChange={(e) => handleMarginChange(e.target.value)}
              onBlur={() => setMarginDraft(null)}
              disabled={base <= 0}
              aria-describedby="margen_final_help"
            />
            <span className="input-group-text bg-body fw-bold">%</span>
          </div>
          <Form.Text id="margen_final_help" className="fs-11">
            {base > 0
              ? 'Utilidad bruta / costo base × 100.'
              : 'Ingresa un costo base mayor que cero.'}
          </Form.Text>
        </Form.Group>
      </Col>
      <Col md={8}>
        <Form.Group controlId="precio_final_venta_input">
          <Form.Label className="fw-bold fs-13 text-body-emphasis mb-1">Precio Final de Venta</Form.Label>
          <div className="input-group w-100">
            <span className="input-group-text bg-body fw-bold text-success">$</span>
            <Form.Control
              type="number"
              min="0"
              step="1"
              className="text-end fw-bold text-success font-monospace"
              value={precioFinal ?? ''}
              onChange={(e) => onPrecioFinalChange(e.target.value)}
            />
            <Button type="button" variant="success" onClick={onSmartRound} className="d-flex align-items-center gap-1">
              <IconifyIcon icon="bx:magic-wand" />
              Redondear
            </Button>
          </div>
          <Form.Text className="fs-11">Incluye impuestos. Puedes editarlo o redondearlo.</Form.Text>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default PrecioFinalVentaInputs;
