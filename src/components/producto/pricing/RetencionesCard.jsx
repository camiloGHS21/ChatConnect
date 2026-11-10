import React, { useState } from 'react';
import { Alert, Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import RetencionesTable from './RetencionesTable';

const isSelectable = item => {
  if (!item || item.estado === 'inactivo' || item.seleccionable === false) return false;
  // Los registros legacy sin metadata conservan la edición manual.
  if (item.codigo == null && item.seleccionable == null) return true;
  return item.seleccionable === true && item.base_calculo !== 'ESPECIAL'
    && item.porcentaje != null && Number.isFinite(Number(item.porcentaje))
    && Number(item.porcentaje) >= 0 && Number(item.porcentaje) <= 100;
};

const sourceUrl = value => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

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

  const selected = withholdingsCatalog.find(w => String(w.id) === String(newWithholding.retencion_id));
  const official = selected?.codigo != null;
  const tipo = official ? 'PORCENTAJE' : newWithholding.tipo;
  const porcentaje = official
    ? (selected.porcentaje != null && Number.isFinite(Number(selected.porcentaje)) ? selected.porcentaje : '')
    : newWithholding.porcentaje;
  const source = sourceUrl(selected?.fuente_url);
  const baseDescription = {
    IVA: 'porcentaje del IVA, no del precio del producto',
    PAGO: 'porcentaje del pago o abono en cuenta',
    AIU: 'porcentaje sobre AIU, no sobre el pago total',
  }[selected?.base_calculo] || 'Consultar norma';

  const handleAddWithholding = () => {
    const item = withholdingsCatalog.find(w => String(w.id) === String(newWithholding.retencion_id));
    if (!isSelectable(item)) return;
    const isDuplicate = (formData.retenciones || []).some(
      r => String(r.retencion_id) === String(newWithholding.retencion_id)
    );
    if (isDuplicate) return;

    // La tasa oficial se toma del catálogo vigente, nunca de una copia editable.
    const entryTipo = item.codigo != null ? 'PORCENTAJE' : newWithholding.tipo;
    const entryRate = Number(item.codigo != null ? item.porcentaje : newWithholding.porcentaje);
    if (entryTipo === 'PORCENTAJE' && (!Number.isFinite(entryRate) || entryRate < 0 || entryRate > 100)) return;
    const entry = {
      id: Date.now(),
      retencion_id: newWithholding.retencion_id,
      nombre_retencion: item.nombre,
      tipo: entryTipo,
      porcentaje: entryTipo === 'PORCENTAJE' ? entryRate : null,
      valor_fijo: entryTipo === 'VALOR_FIJO' ? parseFloat(newWithholding.valor_fijo) || 0 : null,
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
        <p className="text-muted fs-14 mb-0">Asignación de retenciones del catálogo de referencia para bienes y servicios al producto.</p>
      </div>

      <Alert variant="info" className="fs-13 py-2">
        La asignación al producto no liquida retenciones ni depende de su precio unitario.
        Su aplicación se determina en cada operación según el concepto, la base gravable,
        las cuantías mínimas vigentes y las condiciones tributarias de las partes.{' '}
        <Alert.Link href="/configuracion/precios/retenciones" target="_blank" rel="noopener noreferrer">
          Retenciones
        </Alert.Link>
      </Alert>

      {withholdingsCatalog.length === 0 && (
        <Alert variant="warning" className="fs-13 py-2">
          No hay retenciones disponibles en el catálogo. Consulta su configuración en{' '}
          <Alert.Link href="/configuracion/precios/retenciones" target="_blank" rel="noopener noreferrer">
            Retenciones
          </Alert.Link>.
        </Alert>
      )}

      <Card className="border shadow-none mb-3 bg-body-tertiary rounded-3">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col md={4} sm={6}>
              <Form.Label htmlFor="producto-retencion" className="fs-12 fw-semibold mb-1">Seleccionar Retención</Form.Label>
              <Form.Select
                id="producto-retencion"
                size="sm"
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
                  <option key={w.id} value={w.id} disabled={!isSelectable(w) || isAssigned(w.id)}>
                    {w.nombre} {!isSelectable(w) ? '— (No seleccionable)' : isAssigned(w.id) ? '— (Ya asignada)' : ''}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3} sm={6}>
              <Form.Label htmlFor="producto-retencion-tipo" className="fs-12 fw-semibold mb-1">Tipo de Retención</Form.Label>
              <Form.Select id="producto-retencion-tipo" size="sm" disabled={official} value={tipo} onChange={e => {
                if (!official) setNewWithholding({ ...newWithholding, tipo: e.target.value });
              }}>
                <option value="PORCENTAJE">Porcentual (%)</option>
                <option value="VALOR_FIJO">Valor Fijo ($)</option>
              </Form.Select>
            </Col>

            <Col md={3} sm={6}>
              <Form.Label htmlFor="producto-retencion-tarifa" className="fs-12 fw-semibold mb-1">
                {tipo === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Valor Fijo ($)'}
              </Form.Label>
              <Form.Control
                id="producto-retencion-tarifa"
                size="sm"
                type="number"
                step="any"
                min="0"
                max={tipo === 'PORCENTAJE' ? 100 : undefined}
                readOnly={official}
                value={tipo === 'PORCENTAJE' ? porcentaje : newWithholding.valor_fijo}
                onChange={e => {
                  if (official) return;
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
                disabled={!isSelectable(selected) || isAssigned(newWithholding.retencion_id)}
              >
                <IconifyIcon icon="bx:plus" className="me-1" />
                Agregar
              </Button>
            </Col>
          </Row>
          {selected && (
            <div className="fs-13 mt-3" role="status" aria-live="polite">
              <div><strong>Base de cálculo: {selected.base_calculo || 'Consultar norma'}</strong> — {baseDescription}</div>
              <div>Base mínima: {selected.base_minima_uvt == null ? 'Consultar norma' : `${selected.base_minima_uvt} UVT`}</div>
              <div>Condición: {selected.condicion || 'Consultar norma'}</div>
              <div>Norma: {selected.norma || 'Consultar norma'}</div>
              {source ? (
                <a href={source} target="_blank" rel="noopener noreferrer">Fuente oficial (nueva pestaña)</a>
              ) : <span className="text-muted">Fuente no disponible</span>}
              {official && <div className="text-muted">Tarifa oficial de catálogo; tipo y porcentaje no editables.</div>}
            </div>
          )}
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
