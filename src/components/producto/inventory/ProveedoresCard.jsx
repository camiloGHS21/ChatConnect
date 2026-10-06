import { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ProveedoresTable from './ProveedoresTable';

const ProveedoresCard = ({
  formData,
  updateField,
  suppliersCatalog = [],
  onOpenCreateSupplier,
  triggerDeleteConfirm,
}) => {
  const [newSup, setNewSup] = useState({
    proveedor_id: '',
    referencia_proveedor: '',
    precio_proveedor: '',
    principal: false,
  });
  const [error, setError] = useState('');

  const isAssigned = (id) => (formData.proveedores || []).some(p => String(p.proveedor_id) === String(id));

  const handleAdd = () => {
    setError('');
    if (!newSup.proveedor_id) {
      setError('Por favor selecciona un proveedor.');
      return;
    }
    if (isAssigned(newSup.proveedor_id)) {
      setError('Este proveedor ya está asignado al producto.');
      return;
    }

    const supObj = suppliersCatalog.find(s => String(s.id) === String(newSup.proveedor_id));
    const currentList = formData.proveedores || [];
    const isFirst = currentList.length === 0;
    const shouldBePrincipal = newSup.principal || isFirst;

    const updated = currentList.map(item => ({
      ...item,
      principal: shouldBePrincipal ? false : item.principal,
    }));

    updated.push({
      id: Date.now(),
      proveedor_id: newSup.proveedor_id,
      nombre_proveedor: supObj?.nombre || 'Proveedor',
      numero_documento: supObj?.numero_documento || '',
      referencia_proveedor: newSup.referencia_proveedor.trim() || 'PROV-9901',
      precio_proveedor: parseFloat(newSup.precio_proveedor) || 85000,
      principal: shouldBePrincipal,
      estado: 'activo',
    });

    updateField('proveedores', updated);
    setNewSup({ proveedor_id: '', referencia_proveedor: '', precio_proveedor: '', principal: false });
  };

  const handleRemove = (id) => {
    const itemToRemove = (formData.proveedores || []).find(p => p.id === id);
    const updated = (formData.proveedores || []).filter(p => p.id !== id);
    if (itemToRemove?.principal && updated.length > 0) {
      updated[0].principal = true;
    }
    updateField('proveedores', updated);
  };

  const handleSetPrincipal = (id) => {
    updateField(
      'proveedores',
      (formData.proveedores || []).map(p => ({ ...p, principal: p.id === id }))
    );
  };

  return (
    <Card className="border shadow-none mb-4 rounded-3">
      <Card.Header className="bg-body-tertiary py-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <IconifyIcon icon="bx:buildings" className="fs-20 text-primary" />
          <h5 className="card-title mb-0">Proveedores del Producto (Terceros)</h5>
        </div>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-primary fw-semibold text-decoration-none"
          onClick={onOpenCreateSupplier}
        >
          + Crear Proveedor
        </Button>
      </Card.Header>
      <Card.Body className="p-3">
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Row className="g-2 align-items-end mb-3">
          <Col md={4} sm={6}>
            <Form.Label className="fs-12 fw-semibold mb-1">Proveedor</Form.Label>
            <Form.Select
              value={newSup.proveedor_id}
              onChange={e => setNewSup({ ...newSup, proveedor_id: e.target.value })}
            >
              <option value="">-- Seleccionar --</option>
              {suppliersCatalog.map(s => (
                <option key={s.id} value={s.id} disabled={isAssigned(s.id)}>
                  {s.nombre} {s.numero_documento ? `(${s.numero_documento})` : ''} {isAssigned(s.id) ? '— (Ya asignado)' : ''}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} sm={6}>
            <Form.Label className="fs-12 fw-semibold mb-1">Ref. Proveedor</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: CV-9901"
              value={newSup.referencia_proveedor}
              onChange={e => setNewSup({ ...newSup, referencia_proveedor: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Label className="fs-12 fw-semibold mb-1">Precio Proveedor ($)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Ej: 85000"
              value={newSup.precio_proveedor}
              onChange={e => setNewSup({ ...newSup, precio_proveedor: e.target.value })}
            />
          </Col>
          <Col md={2} sm={6}>
            <Button
              variant="primary"
              className="w-100 d-flex align-items-center justify-content-center"
              style={{ height: '38px' }}
              onClick={handleAdd}
              aria-label="Asignar proveedor al producto"
              title="Asignar proveedor al producto"
            >
              <IconifyIcon icon="bx:plus" className="fs-18" />
            </Button>
          </Col>
        </Row>

        <ProveedoresTable
          proveedores={formData.proveedores || []}
          onSetPrincipal={handleSetPrincipal}
          onRemove={handleRemove}
          triggerDeleteConfirm={triggerDeleteConfirm}
        />
      </Card.Body>
    </Card>
  );
};

export default ProveedoresCard;
