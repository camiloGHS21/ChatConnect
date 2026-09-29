import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { DOC_TYPES } from './supplierUtils';
import ModalProveedorGeoFields from './ModalProveedorGeoFields';

/**
 * Campos del formulario para Crear Proveedor (Tercero).
 * Soporta separación de nombre y apellidos para persona natural y catálogo geográfico 1:N.
 */
const ModalNuevoProveedorFields = ({ form, update, handleDocChange }) => {
  return (
    <Row className="g-3">
      {/* Fila 1: Tipo Persona & Tipo Tercero */}
      <Col md={7}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1 d-block">Tipo de Persona *</Form.Label>
        <div className="d-flex align-items-center gap-3 pt-1">
          <Form.Check
            type="radio"
            id="persona-juridica"
            name="tipo_persona"
            label="Persona Jurídica (Empresa)"
            checked={form.tipo_persona === 'juridica'}
            onChange={() => update('tipo_persona', 'juridica')}
            className="fs-13"
          />
          <Form.Check
            type="radio"
            id="persona-natural"
            name="tipo_persona"
            label="Persona Natural"
            checked={form.tipo_persona === 'natural'}
            onChange={() => update('tipo_persona', 'natural')}
            className="fs-13"
          />
        </div>
      </Col>
      <Col md={5}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Tipo de Tercero</Form.Label>
        <Form.Select value={form.tipo_tercero} onChange={e => update('tipo_tercero', e.target.value)}>
          <option value="Proveedor">Proveedor</option>
          <option value="Cliente">Cliente</option>
          <option value="Ambos">Ambos (Cliente / Proveedor)</option>
        </Form.Select>
      </Col>

      {/* Fila 2: Documento, Número y DV */}
      <Col md={5}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Tipo de Documento *</Form.Label>
        <Form.Select
          value={form.tipo_documento}
          onChange={e => {
            update('tipo_documento', e.target.value);
            if (e.target.value !== 'NIT') update('digito_verificacion', '');
          }}
        >
          {DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </Form.Select>
      </Col>
      <Col md={5}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Número de Documento / NIT *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ej: 900123456"
          value={form.numero_documento}
          onChange={e => handleDocChange(e.target.value)}
        />
      </Col>
      <Col md={2}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">DV</Form.Label>
        <Form.Control
          type="text"
          placeholder="0"
          value={form.digito_verificacion}
          onChange={e => update('digito_verificacion', e.target.value.slice(-1))}
          className="text-center"
          maxLength={1}
        />
      </Col>

      {/* Fila 3: Nombres / Apellidos (Persona Natural) o Razón Social (Jurídica) */}
      {form.tipo_persona === 'natural' ? (
        <>
          <Col md={6}>
            <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Nombres *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Juan Carlos"
              value={form.nombre || ''}
              onChange={e => update('nombre', e.target.value)}
            />
          </Col>
          <Col md={6}>
            <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Apellidos *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Pérez Gómez"
              value={form.apellido || ''}
              onChange={e => update('apellido', e.target.value)}
            />
          </Col>
        </>
      ) : (
        <Col md={12}>
          <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Razón Social *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Distribuciones Industriales de Colombia S.A.S."
            value={form.razon_social || ''}
            onChange={e => update('razon_social', e.target.value)}
          />
        </Col>
      )}

      {/* Fila 4: Correo, Teléfono Fijo, WhatsApp */}
      <Col md={4}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Correo Electrónico</Form.Label>
        <Form.Control
          type="email"
          placeholder="compras@proveedor.com"
          value={form.email}
          onChange={e => update('email', e.target.value)}
        />
      </Col>
      <Col md={4}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Teléfono Fijo</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ej: 601 234 5678"
          value={form.telefono_fijo}
          onChange={e => update('telefono_fijo', e.target.value)}
        />
      </Col>
      <Col md={4}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">WhatsApp / Celular</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ej: 300 123 4567"
          value={form.celular}
          onChange={e => update('celular', e.target.value)}
        />
      </Col>

      {/* Fila 5: Selector 1:N Departamento y Ciudad */}
      <ModalProveedorGeoFields form={form} update={update} />
    </Row>
  );
};

export default ModalNuevoProveedorFields;
