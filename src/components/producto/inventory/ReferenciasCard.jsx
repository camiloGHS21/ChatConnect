import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ReferenciasCard = ({ formData, updateField, triggerDeleteConfirm }) => {
  const [newRef, setNewRef] = useState({ referencia: '', descripcion: '' });
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');
    const refCode = newRef.referencia.trim();
    if (!refCode) {
      setError('Por favor ingresa la referencia del producto.');
      return;
    }
    const isDuplicate = (formData.referencias || []).some(
      r => r.referencia.trim().toLowerCase() === refCode.toLowerCase()
    );
    if (isDuplicate) {
      setError(`La referencia "${refCode}" ya existe para este producto.`);
      return;
    }

    const updated = [
      ...(formData.referencias || []),
      {
        id: Date.now(),
        referencia: refCode,
        descripcion: newRef.descripcion.trim(),
        estado: 'activo',
      },
    ];
    updateField('referencias', updated);
    setNewRef({ referencia: '', descripcion: '' });
  };

  const handleRemove = (id) => {
    updateField('referencias', (formData.referencias || []).filter(r => r.id !== id));
  };

  return (
    <Card className="border shadow-none mb-4 rounded-3">
      <Card.Header className="bg-light-subtle py-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <IconifyIcon icon="bx:purchase-tag" className="fs-20 text-primary" />
          <h5 className="card-title mb-0">Referencias del Producto</h5>
        </div>
        <small className="text-muted fs-12">Referencias de catálogo, código de fábrica o modelo</small>
      </Card.Header>
      <Card.Body className="p-3">
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Row className="g-2 align-items-end mb-3">
          <Col md={5}>
            <Form.Label className="fs-12 fw-semibold mb-1">Referencia / Modelo *</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Ej: REF-BOSCH-GSB13RE"
              value={newRef.referencia}
              onChange={e => setNewRef({ ...newRef, referencia: e.target.value })}
            />
          </Col>
          <Col md={5}>
            <Form.Label className="fs-12 fw-semibold mb-1">Descripción / Nota</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Ej: Catálogo 2026, versión percutor"
              value={newRef.descripcion}
              onChange={e => setNewRef({ ...newRef, descripcion: e.target.value })}
            />
          </Col>
          <Col md={2}>
            <Button size="sm" variant="primary" className="w-100" onClick={handleAdd}>
              <IconifyIcon icon="bx:plus" className="me-1" />
              Agregar
            </Button>
          </Col>
        </Row>

        <div className="table-responsive border rounded">
          <Table hover className="table-sm align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Referencia</th>
                <th>Descripción</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {(formData.referencias || []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-3 text-muted fs-13">
                    No se han registrado referencias adicionales para este producto.
                  </td>
                </tr>
              ) : (
                (formData.referencias || []).map(r => (
                  <tr key={r.id}>
                    <td className="fw-bold font-monospace text-dark">{r.referencia}</td>
                    <td className="text-muted">{r.descripcion || '-'}</td>
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => triggerDeleteConfirm ? triggerDeleteConfirm({
                          title: '¿Eliminar referencia?',
                          itemName: r.referencia,
                          onConfirm: () => handleRemove(r.id)
                        }) : handleRemove(r.id)}
                      >
                        <IconifyIcon icon="bx:trash" className="fs-16" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReferenciasCard;
