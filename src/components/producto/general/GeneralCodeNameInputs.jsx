import React from 'react';
import { Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Fila de Código Interno y Nombre del Producto
 * Idéntico a Reback con auto-generación visual y hint de último consecutivo.
 */
const GeneralCodeNameInputs = ({
  formData,
  updateField,
  onGenerateCode,
}) => {
  const currentCode = formData?.codigo_interno || 'PRD-1001';

  return (
    <>
      {/* Código Interno */}
      <Col lg={6} md={6}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label htmlFor="codigo_interno" className="form-label fw-semibold mb-0 fs-13">
              Código Interno <span className="text-danger">*</span>
            </Form.Label>
            <Button
              variant="link"
              size="sm"
              type="button"
              className="p-0 fs-11 text-primary fw-semibold d-inline-flex align-items-center text-decoration-none"
              onClick={onGenerateCode}
              title="Auto-generar consecutivo siguiente"
            >
              <IconifyIcon icon="bx:refresh" className="me-1 fs-14" />
              Auto-generar
            </Button>
          </div>
          <Form.Control
            id="codigo_interno"
            type="text"
            placeholder="Ej: PRD-1002 (presiona Tab para auto-generar)"
            value={currentCode}
            onChange={e => updateField('codigo_interno', e.target.value.toUpperCase())}
          />
          <div className="d-flex align-items-center gap-1 mt-1 text-muted fs-11">
            <IconifyIcon icon="bx:check-circle" className="text-success fs-13" />
            <span>
              Último: <strong>PRD-1001</strong> (Aparato Para Presión) [52] &bull; Presiona <kbd className="bg-light text-dark border px-1 py-0 fs-10">Tab</kbd> o Auto-generar para: <strong className="text-primary">PRD-1002</strong>
            </span>
          </div>
        </div>
      </Col>

      {/* Nombre del Producto */}
      <Col lg={6} md={6}>
        <Form.Group>
          <Form.Label htmlFor="nombre" className="form-label fw-semibold mb-1 fs-13">
            Nombre del Producto <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            id="nombre"
            type="text"
            placeholder="Ej: Zapatillas Deportivas Ultra Light Pro"
            value={formData?.nombre || ''}
            onChange={e => updateField('nombre', e.target.value)}
          />
          <Form.Text className="text-muted fs-11">
            Nombre comercial descriptivo y claro para el catálogo y canales.
          </Form.Text>
        </Form.Group>
      </Col>
    </>
  );
};

export default GeneralCodeNameInputs;
