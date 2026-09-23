import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const AttributesSelectorCard = ({
  allAttributes = [],
  assignedAttributes = [],
  onAssignAttribute,
  onOpenNewAttrModal,
}) => {
  const [selectedAttrId, setSelectedAttrId] = useState('');

  const availableAttributes = allAttributes.filter(
    a => !(assignedAttributes || []).some(x => String(x.id_atributo) === String(a.id_atributo))
  );

  const handleAssign = () => {
    if (!selectedAttrId) return;
    onAssignAttribute(selectedAttrId);
    setSelectedAttrId('');
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
        <div>
          <h5 className="card-title mb-1 fw-bold text-dark fs-15">Atributos del Producto</h5>
          <p className="text-muted fs-14 mb-0">
            Asocia atributos dinámicos (Color, Talla, Material, etc.) al producto
          </p>
        </div>
        <Button
          variant="outline-primary"
          onClick={onOpenNewAttrModal}
          className="fs-13 fw-medium d-flex align-items-center gap-1"
          style={{ borderRadius: '6px' }}
        >
          + Nuevo Atributo
        </Button>
      </div>

      <Card className="border shadow-none mb-4 bg-white rounded-3" style={{ borderColor: '#eef2f6' }}>
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col lg={9} md={8} sm={7}>
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">
                Seleccionar Atributo para Asociar al Producto
              </Form.Label>
              <Form.Select
                value={selectedAttrId}
                onChange={e => setSelectedAttrId(e.target.value)}
                style={{ borderColor: '#dee2e6', borderRadius: '6px', height: '38px' }}
              >
                <option value="">-- Elige un atributo existente --</option>
                {availableAttributes.map(a => (
                  <option key={a.id_atributo} value={a.id_atributo}>
                    {a.nombre} {a.genera_variante ? '• Genera Variantes' : ''}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={3} md={4} sm={5}>
              <Button
                variant="primary"
                className="w-100 fw-medium d-flex align-items-center justify-content-center"
                style={{ height: '38px', borderRadius: '6px' }}
                disabled={!selectedAttrId}
                onClick={handleAssign}
              >
                <IconifyIcon icon="bx:link" className="me-1 fs-16" />
                Asociar Atributo
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default AttributesSelectorCard;
