import { Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Campos básicos del producto: Código interno, nombre, presentación y estados.
 */
const GeneralBasicFields = ({ formData, updateField, onGenerateCode }) => {
  return (
    <Row className="g-3">
      <Col md={4}>
        <Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label htmlFor="codigo_interno" className="mb-0 fs-13 fw-semibold">
              Código Interno <span className="text-danger">*</span>
            </Form.Label>
            <span className="badge bg-light text-muted border fs-11">Auto / Manual</span>
          </div>
          <div className="input-group">
            <Form.Control
              id="codigo_interno"
              type="text"
              placeholder="Ej. FER-0049"
              value={formData?.codigo_interno || ''}
              onChange={e => updateField('codigo_interno', e.target.value.toUpperCase())}
            />
            {onGenerateCode && (
              <Button
                variant="outline-secondary"
                type="button"
                className="d-flex align-items-center gap-1 fs-12"
                onClick={onGenerateCode}
                title="Generar consecutivo automático de la empresa"
              >
                <IconifyIcon icon="bx:refresh" className="fs-15" />
                Auto
              </Button>
            )}
          </div>
          <Form.Text className="text-muted fs-11">
            Identificador único del producto según la secuencia activa.
          </Form.Text>
        </Form.Group>
      </Col>

      <Col md={8}>
        <Form.Group>
          <Form.Label htmlFor="nombre_producto" className="fs-13 fw-semibold">
            Nombre del Producto <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            id="nombre_producto"
            type="text"
            placeholder="Ej. Taladro Percutor 1/2 Pulgada 20V MAX XR"
            value={formData?.nombre || ''}
            onChange={e => updateField('nombre', e.target.value)}
          />
          <Form.Text className="text-muted fs-11">
            Nombre comercial descriptivo y claro para el catálogo y canales de venta.
          </Form.Text>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label htmlFor="presentacion" className="fs-13 fw-semibold">
            Presentación <span className="text-muted fw-normal fs-12">(Opcional)</span>
          </Form.Label>
          <Form.Control
            id="presentacion"
            type="text"
            placeholder="Ej. Caja x 1 Und / Bulto 50Kg"
            value={formData?.presentacion || ''}
            onChange={e => updateField('presentacion', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label htmlFor="estado_producto" className="fs-13 fw-semibold">
            Estado del Producto
          </Form.Label>
          <Form.Select
            id="estado_producto"
            value={formData?.estado_producto || 'activo'}
            onChange={e => updateField('estado_producto', e.target.value)}
          >
            <option value="activo">Activo (Habilitado para operar)</option>
            <option value="inactivo">Inactivo (Suspendido)</option>
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label htmlFor="estado_publicacion" className="fs-13 fw-semibold">
            Visibilidad en Catálogo / WhatsApp
          </Form.Label>
          <Form.Select
            id="estado_publicacion"
            value={formData?.estado_publicacion || 'publicado'}
            onChange={e => updateField('estado_publicacion', e.target.value)}
          >
            <option value="publicado">Publicado (Visible en chatbot y web)</option>
            <option value="no_publicado">No Publicado (Oculto)</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default GeneralBasicFields;
