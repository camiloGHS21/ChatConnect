import React from 'react';
import { Card, Badge, Row, Col, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import StatusRadioCard from './StatusRadioCard';

/**
 * Card 3: Estado Operativo y Visibilidad
 * Idéntico al diseño del template Reback con radio cards interactivas.
 */
const GeneralStatusCard = ({ formData, updateField }) => {
  return (
    <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
      <style>{`
        .status-radio-card {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .status-radio-card:hover {
          border-color: #0d6efd !important;
        }
      `}</style>

      <Card.Header className="bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-bold text-dark d-flex align-items-center fs-14">
          <IconifyIcon icon="bx:check-shield" className="me-2 text-success fs-18" />
          Estado y Visibilidad del Producto
        </h6>
        <Badge bg="success-subtle" className="text-success border border-success border-opacity-25 fs-11">
          Publicación
        </Badge>
      </Card.Header>

      <Card.Body className="p-3">
        <Row className="g-3">
          {/* Estado Operativo */}
          <Col md={6}>
            <Form.Label className="form-label fw-semibold d-block mb-2 fs-13">
              Estado Operativo
            </Form.Label>
            <div className="d-flex gap-2">
              <StatusRadioCard
                id="estado_activo"
                name="estado_producto"
                checked={formData?.estado_producto === 'activo'}
                onClick={() => updateField('estado_producto', 'activo')}
                icon="bx:check-circle"
                activeTheme="success"
                title="Activo"
                subtitle="Disponible para venta e inventario"
              />
              <StatusRadioCard
                id="estado_inactivo"
                name="estado_producto"
                checked={formData?.estado_producto === 'inactivo'}
                onClick={() => updateField('estado_producto', 'inactivo')}
                icon="bx:x-circle"
                activeTheme="danger"
                title="Inactivo"
                subtitle="Suspendido temporalmente"
              />
            </div>
          </Col>

          {/* Visibilidad / Publicación */}
          <Col md={6}>
            <Form.Label className="form-label fw-semibold d-block mb-2 fs-13">
              Visibilidad en Canales / WhatsApp
            </Form.Label>
            <div className="d-flex gap-2">
              <StatusRadioCard
                id="publicacion_publicado"
                name="estado_publicacion"
                checked={formData?.estado_publicacion === 'publicado'}
                onClick={() => updateField('estado_publicacion', 'publicado')}
                icon="bx:globe"
                activeTheme="primary"
                title="Publicado"
                subtitle="Visible en catálogo y canales"
              />
              <StatusRadioCard
                id="publicacion_no_publicado"
                name="estado_publicacion"
                checked={formData?.estado_publicacion === 'no_publicado'}
                onClick={() => updateField('estado_publicacion', 'no_publicado')}
                icon="bx:hide"
                activeTheme="secondary"
                title="No Publicado"
                subtitle="Borrador privado / oculto"
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GeneralStatusCard;
