
import { Row, Col, Form } from 'react-bootstrap';
import TextFormInput from '@/components/form/TextFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';

const SeoTargetAiCard = ({ control, formData, updateField, setValue }) => {
  return (
    <>
      <Row>
        <Col lg={4} md={6}>
          <TextFormInput
            control={control}
            name="publico_objetivo"
            id="publico_objetivo"
            label="Público Objetivo"
            placeholder="Ej: Maestros de obra, carpinteros, hogar"
            containerClassName="mb-3"
          />
        </Col>

        <Col lg={4} md={6}>
          <TextFormInput
            control={control}
            name="usos"
            id="usos"
            label="Usos y Aplicaciones"
            placeholder="Ej: Construcción pesada, remodelación, talleres"
            containerClassName="mb-3"
          />
        </Col>

        <Col lg={4} md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold fs-13 text-body-emphasis d-block">Visibilidad en Buscadores</Form.Label>
            <div className="p-2 border rounded bg-body-tertiary d-flex align-items-center justify-content-between">
              <span className="fs-13 text-muted">¿Indexable en Google/Bing?</span>
              <Form.Check
                type="switch"
                id="indexable"
                aria-label="Permitir que Google y Bing indexen el producto"
                checked={Boolean(formData?.indexable)}
                onChange={e => {
                  updateField('indexable', e.target.checked);
                  if (setValue) setValue('indexable', e.target.checked);
                }}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <TextAreaFormInput
            control={control}
            name="caracteristicas"
            id="caracteristicas"
            label="Características Destacadas"
            rows={3}
            placeholder="Puntos fuertes destacados para la IA..."
            containerClassName="mb-3"
          />
        </Col>

        <Col lg={6}>
          <TextAreaFormInput
            control={control}
            name="contenido_ia"
            id="contenido_ia"
            label="Contexto para Agentes de IA / WhatsApp"
            rows={3}
            placeholder="Instrucciones para que el asistente de WhatsApp asesore al cliente sobre este producto..."
            containerClassName="mb-3"
          />
        </Col>
      </Row>
    </>
  );
};

export default SeoTargetAiCard;
