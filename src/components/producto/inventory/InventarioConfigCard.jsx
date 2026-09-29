import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const InventarioConfigCard = ({
  formData,
  updateField,
  inventoryTypesCatalog = [],
  measuresCatalog = [],
  errors = {},
}) => {
  return (
    <Card className="border shadow-none mb-4 rounded-3">
      <Card.Header className="bg-light-subtle py-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <IconifyIcon icon="bx:box" className="fs-20 text-primary" />
          <h5 className="card-title mb-0">Control y Configuración de Inventario</h5>
        </div>
        <Form.Check
          type="switch"
          id="maneja-inventario-switch"
          label={formData.maneja_inventario ? 'Control de Stock Activo' : 'Sin Control de Stock'}
          checked={!!formData.maneja_inventario}
          onChange={e => updateField('maneja_inventario', e.target.checked)}
          className="fw-semibold text-primary"
        />
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold fs-13">Tipo de Inventario</Form.Label>
              <Form.Select
                value={formData.tipo_inventario_id || ''}
                onChange={e => updateField('tipo_inventario_id', e.target.value)}
                disabled={!formData.maneja_inventario}
              >
                <option value="">-- Seleccionar tipo de inventario --</option>
                {inventoryTypesCatalog.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted fs-12">
                Clasificación operativa según DOC 02 (mercancía para venta, consumo, servicio).
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold fs-13">Unidad de Medida</Form.Label>
              <Form.Select
                value={formData.medida_id || ''}
                onChange={e => updateField('medida_id', e.target.value)}
              >
                <option value="">-- Seleccionar unidad de medida --</option>
                {measuresCatalog.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted fs-12">
                Unidad base para transacciones comerciales y conteo de existencias.
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold fs-13">Stock Mínimo</Form.Label>
              <Form.Control
                type="number"
                min="0"
                isInvalid={!!errors?.stock_minimo}
                value={formData.stock_minimo ?? 0}
                onChange={e => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updateField('stock_minimo', val);
                  if (formData.stock_maximo != null && val > formData.stock_maximo) {
                    updateField('stock_maximo', val);
                  }
                }}
                disabled={!formData.maneja_inventario}
              />
              {errors?.stock_minimo ? (
                <Form.Control.Feedback type="invalid" className="d-block fs-11">
                  {errors.stock_minimo}
                </Form.Control.Feedback>
              ) : (
                <Form.Text className="text-muted fs-12">Alerta de reposición.</Form.Text>
              )}
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold fs-13">Stock Máximo</Form.Label>
              <Form.Control
                type="number"
                min="0"
                isInvalid={!!errors?.stock_maximo}
                value={formData.stock_maximo ?? 0}
                onChange={e => updateField('stock_maximo', Math.max(0, parseInt(e.target.value) || 0))}
                disabled={!formData.maneja_inventario}
              />
              {errors?.stock_maximo ? (
                <Form.Control.Feedback type="invalid" className="d-block fs-11">
                  {errors.stock_maximo}
                </Form.Control.Feedback>
              ) : (
                <Form.Text className="text-muted fs-12">Capacidad sugerida (&ge; mínimo).</Form.Text>
              )}
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-semibold fs-13">Presentación Física</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Caja x 24 unidades, Galón, Bulto 50kg"
                value={formData.presentacion || ''}
                onChange={e => updateField('presentacion', e.target.value)}
              />
              <Form.Text className="text-muted fs-12">Descripción manual del empaque.</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default InventarioConfigCard;
