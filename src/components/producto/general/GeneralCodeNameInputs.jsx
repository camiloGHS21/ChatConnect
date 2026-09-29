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
  errors = {},
}) => {
  const currentCode = formData?.codigo_interno || '';

  return (
    <>
      {/* Código Interno */}
      <Col lg={6} md={6}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label htmlFor="codigo_interno" className="form-label fw-semibold mb-0 fs-13">
              Código Interno <span className="text-primary fw-normal fs-11">(Auto por BD)</span>
            </Form.Label>
            <Button
              variant="link"
              size="sm"
              type="button"
              className="p-0 fs-11 text-primary fw-semibold d-inline-flex align-items-center text-decoration-none"
              onClick={onGenerateCode}
              title="Auto-generar consecutivo siguiente desde base de datos"
            >
              <IconifyIcon icon="bx:refresh" className="me-1 fs-14" />
              Auto-generar
            </Button>
          </div>
          <Form.Control
            id="codigo_interno"
            type="text"
            maxLength={100}
            isInvalid={!!errors?.codigo_interno}
            placeholder="Clic en Auto-generar o ingresa código"
            value={currentCode}
            onChange={e => updateField('codigo_interno', e.target.value.toUpperCase())}
          />
          {errors?.codigo_interno ? (
            <Form.Control.Feedback type="invalid" className="d-block fs-11">
              {errors.codigo_interno}
            </Form.Control.Feedback>
          ) : (
            <Form.Text className="text-muted fs-11 d-flex align-items-center gap-1 mt-1">
              <IconifyIcon icon="bx:info-circle" className="text-primary fs-13" />
              <span>Secuencia oficial de PostgreSQL (se asigna automáticamente por trigger si está vacío).</span>
            </Form.Text>
          )}
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
            maxLength={250}
            isInvalid={!!errors?.nombre}
            placeholder="Ingresa el nombre del producto"
            value={formData?.nombre || ''}
            onChange={e => updateField('nombre', e.target.value)}
          />
          {errors?.nombre ? (
            <Form.Control.Feedback type="invalid" className="d-block fs-11">
              {errors.nombre}
            </Form.Control.Feedback>
          ) : (
            <Form.Text className="text-muted fs-11">
              Nombre comercial descriptivo y claro para el catálogo (máx 250 caracteres).
            </Form.Text>
          )}
        </Form.Group>
      </Col>
    </>
  );
};

export default GeneralCodeNameInputs;
