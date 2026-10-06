import { Col, Row, Form } from 'react-bootstrap';
import ProductRichTextEditor from './ProductRichTextEditor';
import 'react-quill-new/dist/quill.snow.css';
import './product-quill.css';

/**
 * Campos de descripciones y ficha técnica con editor enriquecido ReactQuill.
 */
const GeneralDescriptionFields = ({ formData, updateField }) => {
  return (
    <Row className="g-3 mt-1">
      <Col md={12}>
        <Form.Group>
          <Form.Label htmlFor="descripcion_corta" className="fs-13 fw-semibold">
            Descripción Corta
          </Form.Label>
          <Form.Control
            id="descripcion_corta"
            as="textarea"
            rows={2}
            placeholder="Resumen conciso del producto para listas y mensajes rápidos..."
            value={formData?.descripcion_corta || ''}
            onChange={e => updateField('descripcion_corta', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group>
          <Form.Label className="fs-13 fw-semibold">
            Descripción Detallada / Comercial
          </Form.Label>
          <div className="product-quill-wrapper bg-body rounded border">
            <ProductRichTextEditor
              label="Descripción detallada y comercial"
              theme="snow"
              value={formData?.descripcion_larga || ''}
              onChange={val => updateField('descripcion_larga', val)}
              placeholder="Escribe características completas, beneficios y recomendaciones de uso..."
              style={{ minHeight: '160px' }}
            />
          </div>
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group>
          <Form.Label htmlFor="ficha_tecnica" className="fs-13 fw-semibold">
            Ficha Técnica / Especificaciones
          </Form.Label>
          <Form.Control
            id="ficha_tecnica"
            as="textarea"
            rows={3}
            placeholder={'Potencia: 20 V\nVelocidad: 0-2000 RPM\nMandril: 1/2 pulgada\nPeso: 1,8 kg...'}
            value={formData?.ficha_tecnica || ''}
            onChange={e => updateField('ficha_tecnica', e.target.value)}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default GeneralDescriptionFields;
