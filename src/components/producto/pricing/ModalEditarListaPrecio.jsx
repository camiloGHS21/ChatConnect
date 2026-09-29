import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  calcPriceListByBase,
  calcPriceListByUtilidad,
  calcPriceListByVenta,
} from './pricingCalculations';

/**
 * Modal para editar valores de una lista de precios asignada al producto.
 * Permite ajustar precio base, margen de utilidad o precio de venta final con recálculo dinámico.
 */
const ModalEditarListaPrecio = ({
  show,
  item,
  costoBase = 0,
  onHide,
  onSave,
}) => {
  const [form, setForm] = useState({
    precio_base: '',
    utilidad_porcentaje: '',
    precio_venta: '',
    impuesto_porcentaje: 19,
  });

  useEffect(() => {
    if (item) {
      setForm({
        precio_base: item.precio_base || '',
        utilidad_porcentaje: item.utilidad_porcentaje || '',
        precio_venta: item.precio_venta || '',
        impuesto_porcentaje: item.impuesto_porcentaje || 19,
      });
    }
  }, [item]);

  if (!item) return null;

  const tax = Number(form.impuesto_porcentaje) || 19;

  const handleBaseChange = (val) => {
    const res = calcPriceListByBase(val, costoBase, tax);
    setForm(prev => ({ ...prev, ...res }));
  };

  const handleUtilChange = (val) => {
    const res = calcPriceListByUtilidad(val, costoBase, form.precio_base, tax);
    setForm(prev => ({ ...prev, ...res }));
  };

  const handleVentaChange = (val) => {
    const res = calcPriceListByVenta(val, costoBase, tax);
    setForm(prev => ({ ...prev, ...res }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pBase = parseFloat(form.precio_base) || 0;
    const cBase = parseFloat(costoBase) || 0;
    const utilPorc = parseFloat(form.utilidad_porcentaje) || (cBase > 0 ? ((pBase - cBase) / cBase) * 100 : 0);
    const utilVal = pBase - cBase;
    const pVenta = parseFloat(form.precio_venta) || (pBase * (1 + tax / 100));

    onSave({
      ...item,
      precio_base: Math.round(pBase * 100) / 100,
      utilidad_porcentaje: Math.round(utilPorc * 100) / 100,
      utilidad_valor: Math.round(utilVal * 100) / 100,
      impuesto_porcentaje: tax,
      precio_venta: Math.round(pVenta * 100) / 100,
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom py-2">
        <Modal.Title className="fs-15 fw-semibold text-dark d-flex align-items-center">
          <IconifyIcon icon="bx:edit-alt" className="me-2 text-primary fs-18" />
          Editar Valores: {item.nombre_lista}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3">
          <Row className="g-3">
            <Col md={12}>
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Precio Base</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light text-muted fs-13">$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="any"
                  value={form.precio_base}
                  onChange={e => handleBaseChange(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </InputGroup>
            </Col>

            <Col md={6}>
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">% Utilidad</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  step="any"
                  value={form.utilidad_porcentaje}
                  onChange={e => handleUtilChange(e.target.value)}
                  placeholder="0.00"
                />
                <InputGroup.Text className="bg-light text-muted fs-13">%</InputGroup.Text>
              </InputGroup>
            </Col>

            <Col md={6}>
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Impuesto Venta</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={`${tax}%`}
                  disabled
                  className="bg-light text-muted"
                />
              </InputGroup>
            </Col>

            <Col md={12}>
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Precio de Venta Final</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light text-muted fs-13">$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="any"
                  value={form.precio_venta}
                  onChange={e => handleVentaChange(e.target.value)}
                  placeholder="0.00"
                  className="fw-bold text-success font-monospace"
                  required
                />
              </InputGroup>
              <Form.Text className="text-muted fs-11">
                Al modificar cualquiera de los 3 valores, los demás se recalculan automáticamente.
              </Form.Text>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="light" size="sm" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" size="sm" type="submit">Actualizar Lista</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEditarListaPrecio;
