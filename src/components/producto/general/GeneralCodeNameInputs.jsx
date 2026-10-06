
import { Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Fila de Código Interno, Nombre y Referencia Comercial del Producto
 * Sincronizado para catálogo general y catálogo de WhatsApp.
 */
const GeneralCodeNameInputs = ({
  formData,
  updateField,
  onGenerateCode,
  errors = {},
}) => {
  const currentCode = formData?.codigo_interno || '';
  const currentRef = formData?.referencia || (formData?.referencias?.[0]?.referencia || '');

  const handleRefChange = (val) => {
    const clean = val.toUpperCase();
    updateField('referencia', clean);
    const existing = Array.isArray(formData?.referencias) ? [...formData.referencias] : [];
    if (existing.length === 0) {
      if (clean) {
        updateField('referencias', [{ id: 1, referencia: clean, descripcion: 'Referencia principal', estado: 'activo' }]);
      }
    } else {
      existing[0] = { ...existing[0], referencia: clean };
      updateField('referencias', existing);
    }
  };

  return (
    <>
      {/* Código Interno */}
      <Col lg={4} md={6}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label htmlFor="codigo_interno" className="form-label fw-semibold mb-0 fs-13">
              Código Interno <span className="text-primary fw-normal fs-11">(Automático)</span>
            </Form.Label>
            <Button
              variant="link"
              size="sm"
              type="button"
              className="p-0 fs-11 text-primary fw-semibold d-inline-flex align-items-center text-decoration-none"
              onClick={onGenerateCode}
              title="Generar automáticamente el siguiente consecutivo"
            >
              <IconifyIcon icon="bx:refresh" className="me-1 fs-14" />
              Generar
            </Button>
          </div>
          <Form.Control
            id="codigo_interno"
            type="text"
            maxLength={100}
            isInvalid={!!errors?.codigo_interno}
            placeholder="Ej: PRD-001"
            value={currentCode}
            onChange={e => updateField('codigo_interno', e.target.value.toUpperCase())}
          />
          {errors?.codigo_interno && (
            <Form.Control.Feedback type="invalid" className="d-block fs-11">
              {errors.codigo_interno}
            </Form.Control.Feedback>
          )}
        </div>
      </Col>

      {/* Nombre del Producto */}
      <Col lg={4} md={6}>
        <Form.Group>
          <Form.Label htmlFor="nombre" className="form-label fw-semibold mb-1 fs-13">
            Nombre del Producto <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            id="nombre"
            type="text"
            maxLength={250}
            isInvalid={!!errors?.nombre}
            placeholder="Ej: Camisa Polo Manga Corta"
            value={formData?.nombre || ''}
            onChange={e => updateField('nombre', e.target.value)}
          />
          {errors?.nombre && (
            <Form.Control.Feedback type="invalid" className="d-block fs-11">
              {errors.nombre}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Col>

      {/* Referencia Comercial / WhatsApp */}
      <Col lg={4} md={12}>
        <Form.Group>
          <Form.Label htmlFor="referencia" className="form-label fw-semibold mb-1 fs-13">
            Referencia / Modelo <span className="text-primary fw-normal fs-11">(WhatsApp)</span>
          </Form.Label>
          <Form.Control
            id="referencia"
            type="text"
            maxLength={150}
            placeholder="Ej: REF-CAMISA-01"
            value={currentRef}
            onChange={e => handleRefChange(e.target.value)}
          />
          <Form.Text className="text-muted fs-11">
            Se sincroniza con el catálogo de WhatsApp.
          </Form.Text>
        </Form.Group>
      </Col>
    </>
  );
};

export default GeneralCodeNameInputs;
