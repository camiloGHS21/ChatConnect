import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import RetencionesTable from './RetencionesTable';

const RetencionesCard = ({
  formData,
  updateField,
  withholdingsCatalog = [],
  triggerDeleteConfirm,
}) => {
  const [newWithholding, setNewWithholding] = useState({
    retencion_id: '',
    tipo: 'PORCENTAJE',
    porcentaje: 0,
    valor_fijo: 0,
  });

  const precioBase = parseFloat(formData?.precio_base || formData?.costo_base || 0);
  const aplicaRetencion = precioBase >= 500000;

  const retencionesCount = formData?.retenciones?.length || 0;
  React.useEffect(() => {
    if (!aplicaRetencion && retencionesCount > 0) {
      updateField('retenciones', []);
    }
  }, [aplicaRetencion, retencionesCount, updateField]);

  const handleAddWithholding = () => {
    if (!aplicaRetencion || !newWithholding.retencion_id) return;
    const item = withholdingsCatalog.find(w => String(w.id) === String(newWithholding.retencion_id));
    const isDuplicate = (formData.retenciones || []).some(
      r => String(r.retencion_id) === String(newWithholding.retencion_id)
    );
    if (isDuplicate) return;

    const entry = {
      id: Date.now(),
      retencion_id: newWithholding.retencion_id,
      nombre_retencion: item?.nombre || 'Retención',
      tipo: newWithholding.tipo,
      porcentaje: newWithholding.tipo === 'PORCENTAJE' ? parseFloat(newWithholding.porcentaje) || 0 : null,
      valor_fijo: newWithholding.tipo === 'VALOR_FIJO' ? parseFloat(newWithholding.valor_fijo) || 0 : null,
      estado: 'activo',
    };
    updateField('retenciones', [...(formData.retenciones || []), entry]);
    setNewWithholding({ retencion_id: '', tipo: 'PORCENTAJE', porcentaje: 0, valor_fijo: 0 });
  };

  const handleRemoveWithholding = (id) => {
    updateField('retenciones', (formData.retenciones || []).filter(r => r.id !== id));
  };

  const isAssigned = (id) => (formData?.retenciones || []).some(r => String(r.retencion_id) === String(id));

  return (
    <>
      <div className="mb-3 mt-4">
        <h5 className="card-title mb-1">Retenciones Fiscales</h5>
        <p className="text-muted fs-14 mb-0">Retenciones fiscales aplicables al producto (ReteFuente, ReteIVA, ReteICA)</p>
      </div>


      <Card className="border shadow-none mb-3 bg-body-tertiary rounded-3">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col md={4} sm={6}>
              <Form.Label className="fs-12 fw-semibold mb-1">Seleccionar Retención</Form.Label>
              <Form.Select
                size="sm"
                disabled={!aplicaRetencion}
                value={newWithholding.retencion_id}
                onChange={e => {
                  const rId = e.target.value;
                  const item = withholdingsCatalog.find(w => String(w.id) === String(rId));
                  setNewWithholding({
                    ...newWithholding,
                    retencion_id: rId,
                    tipo: item?.tipo || 'PORCENTAJE',
                    porcentaje: item?.porcentaje || 0,
                    valor_fijo: item?.valor_fijo || 0,
                  });
                }}
              >
                <option value="">-- Seleccionar retención --</option>
                {withholdingsCatalog.map(w => (
                  <option key={w.id} value={w.id} disabled={isAssigned(w.id)}>
                    {w.nombre} {isAssigned(w.id) ? '— (Ya aplicada)' : ''}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3} sm={6}>
              <Form.Label className="fs-12 fw-semibold mb-1">Tipo de Retención</Form.Label>
              <Form.Select size="sm" disabled={!aplicaRetencion} value={newWithholding.tipo} onChange={e => setNewWithholding({ ...newWithholding, tipo: e.target.value })}>
                <option value="PORCENTAJE">Porcentual (%)</option>
                <option value="VALOR_FIJO">Valor Fijo ($)</option>
              </Form.Select>
            </Col>

            <Col md={3} sm={6}>
              <Form.Label className="fs-12 fw-semibold mb-1">
                {newWithholding.tipo === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Valor Fijo ($)'}
              </Form.Label>
              <Form.Control
                size="sm"
                type="number"
                step="0.01"
                disabled={!aplicaRetencion}
                value={newWithholding.tipo === 'PORCENTAJE' ? newWithholding.porcentaje : newWithholding.valor_fijo}
                onChange={e => {
                  if (newWithholding.tipo === 'PORCENTAJE') {
                    setNewWithholding({ ...newWithholding, porcentaje: e.target.value, valor_fijo: 0 });
                  } else {
                    setNewWithholding({ ...newWithholding, valor_fijo: e.target.value, porcentaje: 0 });
                  }
                }}
              />
            </Col>

            <Col md={2} sm={6}>
              <Button
                variant="primary"
                size="sm"
                className="w-100"
                onClick={handleAddWithholding}
                disabled={!aplicaRetencion || !newWithholding.retencion_id || isAssigned(newWithholding.retencion_id)}
              >
                <IconifyIcon icon="bx:plus" className="me-1" />
                Agregar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <RetencionesTable
        retenciones={formData.retenciones || []}
        onRemove={handleRemoveWithholding}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />
    </>
  );
};

export default RetencionesCard;
