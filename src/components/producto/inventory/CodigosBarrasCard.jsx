import { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import CodigosBarrasTable from './CodigosBarrasTable';

const CodigosBarrasCard = ({ formData, updateField, triggerDeleteConfirm }) => {
  const [newBarcode, setNewBarcode] = useState({
    codigo_barras: '',
    descripcion: '',
    principal: false,
  });
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    const code = newBarcode.codigo_barras.trim();
    if (!code) {
      setError('Por favor ingresa el código de barras.');
      return;
    }
    const isDuplicate = (formData.codigos_barras || []).some(
      b => b.codigo_barras.trim().toLowerCase() === code.toLowerCase()
    );
    if (isDuplicate) {
      setError(`El código de barras "${code}" ya está agregado.`);
      return;
    }

    const currentList = formData.codigos_barras || [];
    const shouldBePrincipal = newBarcode.principal || currentList.length === 0;

    const updated = currentList.map(item => ({
      ...item,
      principal: shouldBePrincipal ? false : item.principal,
    }));

    updated.push({
      id: Date.now(),
      codigo_barras: code,
      descripcion: newBarcode.descripcion.trim(),
      principal: shouldBePrincipal,
      estado: 'activo',
    });

    updateField('codigos_barras', updated);
    setNewBarcode({ codigo_barras: '', descripcion: '', principal: false });
  };

  const handleRemove = (id) => {
    const itemToRemove = (formData.codigos_barras || []).find(b => b.id === id);
    const updated = (formData.codigos_barras || []).filter(b => b.id !== id);
    if (itemToRemove?.principal && updated.length > 0) {
      updated[0].principal = true;
    }
    updateField('codigos_barras', updated);
  };

  const handleSetPrincipal = (id) => {
    updateField(
      'codigos_barras',
      (formData.codigos_barras || []).map(b => ({ ...b, principal: b.id === id }))
    );
  };

  return (
    <Card className="border shadow-none mb-4 rounded-3">
      <Card.Header className="bg-body-tertiary py-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <IconifyIcon icon="bx:barcode" className="fs-20 text-primary" />
          <h5 className="card-title mb-0">Códigos de Barras</h5>
        </div>
        <small className="text-muted fs-12">Admite múltiples códigos (EAN-13, UPC, Code 128)</small>
      </Card.Header>
      <Card.Body className="p-3">
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Row className="g-2 align-items-end mb-3">
          <Col md={5}>
            <Form.Label className="fs-12 fw-semibold mb-1">Código de Barras *</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Ej: 7701234567890"
              value={newBarcode.codigo_barras}
              onChange={e => setNewBarcode({ ...newBarcode, codigo_barras: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Label className="fs-12 fw-semibold mb-1">Descripción / Empaque</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Ej: Unidad individual, Caja x12"
              value={newBarcode.descripcion}
              onChange={e => setNewBarcode({ ...newBarcode, descripcion: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <div className="d-flex align-items-center gap-2">
              <Form.Check
                type="checkbox"
                id="check-barcode-principal"
                label="Principal"
                className="fs-12 fw-semibold"
                checked={newBarcode.principal}
                onChange={e => setNewBarcode({ ...newBarcode, principal: e.target.checked })}
              />
              <Button size="sm" variant="primary" className="ms-auto" onClick={handleAdd}>
                <IconifyIcon icon="bx:plus" className="me-1" />
                Agregar
              </Button>
            </div>
          </Col>
        </Row>

        <CodigosBarrasTable
          codigosBarras={formData.codigos_barras || []}
          onSetPrincipal={handleSetPrincipal}
          onRemove={handleRemove}
          triggerDeleteConfirm={triggerDeleteConfirm}
        />
      </Card.Body>
    </Card>
  );
};

export default CodigosBarrasCard;
