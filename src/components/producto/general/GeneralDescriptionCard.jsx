import React, { useMemo } from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { checkMetaCompliance } from '@/utils/metaPolicyValidator';
import 'react-quill-new/dist/quill.snow.css';

/**
 * Card 2: Descripciones y Ficha Técnica
 * Idéntico al diseño del template Reback con ReactQuill integrado y validador de políticas Meta.
 */
const GeneralDescriptionCard = ({ formData, updateField }) => {
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'clean'],
    ],
  };

  const compliance = useMemo(() => {
    return checkMetaCompliance(
      formData?.nombre || '',
      `${formData?.descripcion_corta || ''} ${formData?.descripcion_larga || ''}`
    );
  }, [formData?.nombre, formData?.descripcion_corta, formData?.descripcion_larga]);

  return (
    <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
      <style>{`
        .product-quill-wrapper .ql-toolbar.ql-snow {
          border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem;
          border-color: #dee2e6; background-color: #f8f9fa; padding: 8px 12px;
        }
        .product-quill-wrapper .ql-container.ql-snow {
          border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem;
          border-color: #dee2e6; background-color: #ffffff; font-family: inherit; font-size: 14px;
        }
        .product-quill-wrapper .ql-editor { min-height: 120px; max-height: 240px; overflow-y: auto; padding: 10px 12px; }
        .product-quill-wrapper .ql-editor.ql-blank::before { color: #adb5bd; font-style: normal; left: 12px; }
      `}</style>

      <Card.Header className="bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-bold text-dark d-flex align-items-center fs-14">
          <IconifyIcon icon="bx:detail" className="me-2 text-info fs-18" />
          Descripciones y Ficha Técnica
        </h6>
        <Badge bg="info-subtle" className="text-info border border-info border-opacity-25 fs-11">
          Detalles Comerciales
        </Badge>
      </Card.Header>

      <Card.Body className="p-3">
        {compliance.warnings.length > 0 && (
          <div className="alert alert-warning py-2 px-3 mb-3 fs-12 rounded border-warning-subtle">
            <div className="d-flex align-items-center gap-1 fw-bold text-dark mb-1">
              <IconifyIcon icon="bx:error" className="text-warning fs-16" />
              <span>Aviso de Políticas Meta (WhatsApp):</span>
            </div>
            <ul className="mb-0 ps-3 text-secondary">
              {compliance.warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <Form.Group>
            <Form.Label htmlFor="descripcion_corta" className="fw-semibold fs-13 mb-1">
              Descripción Corta (Resumen para catálogo)
            </Form.Label>
            <Form.Control
              id="descripcion_corta"
              as="textarea"
              rows={2}
              placeholder="Breve resumen comercial para catálogos y WhatsApp..."
              value={formData?.descripcion_corta || ''}
              onChange={(e) => updateField('descripcion_corta', e.target.value)}
            />
          </Form.Group>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label className="form-label fw-semibold mb-0 fs-13">
              Descripción Larga del Producto
            </Form.Label>
            <span className="text-muted fs-11">Formato enriquecido</span>
          </div>
          <div className="product-quill-wrapper">
            <ReactQuill
              theme="snow"
              value={formData?.descripcion_larga || ''}
              onChange={(content) => updateField('descripcion_larga', content)}
              placeholder="Escribe una descripción completa y atractiva del producto..."
              modules={quillModules}
            />
          </div>
        </div>

        <div>
          <Form.Group>
            <Form.Label htmlFor="ficha_tecnica" className="fw-semibold fs-13 mb-1">
              Ficha Técnica / Especificaciones
            </Form.Label>
            <Form.Control
              id="ficha_tecnica"
              as="textarea"
              rows={5}
              placeholder="Especificaciones técnicas: dimensiones, composición, peso, certificaciones..."
              value={formData?.ficha_tecnica || ''}
              onChange={(e) => updateField('ficha_tecnica', e.target.value)}
            />
          </Form.Group>
        </div>
      </Card.Body>
    </Card>
  );
};

export default GeneralDescriptionCard;
