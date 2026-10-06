import { useState } from 'react';
import { Row, Col, Form, Button, Badge } from 'react-bootstrap';
import TextFormInput from '@/components/form/TextFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Campos principales de SEO y Palabras Clave.
 * Idéntico al diseño del template Reback y a la captura oficial de Metadata.
 */
const SeoInputsCard = ({
  control,
  formData,
  updateField,
  setValue,
}) => {
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!newTagInput.trim()) return;
      const currentTags = formData?.etiquetas || [];
      if (!currentTags.includes(newTagInput.trim())) {
        const updated = [...currentTags, newTagInput.trim()];
        updateField('etiquetas', updated);
        if (setValue) setValue('etiquetas', updated);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updated = (formData?.etiquetas || []).filter(t => t !== tagToRemove);
    updateField('etiquetas', updated);
    if (setValue) setValue('etiquetas', updated);
  };

  return (
    <>
      <Row>
        <Col lg={6} md={6}>
          <TextFormInput
            control={control}
            name="titulo_seo"
            id="titulo_seo"
            label="Título SEO"
            placeholder="Título para Google..."
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={6} md={6}>
          <TextFormInput
            control={control}
            name="slug"
            id="slug"
            label="URL amigable"
            placeholder="/productos/mi-producto"
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={12}>
          <TextAreaFormInput
            control={control}
            name="descripcion_seo"
            id="descripcion_seo"
            label="Descripción para buscadores (SEO)"
            rows={2}
            placeholder="Descripción para buscadores..."
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={6}>
          <TextAreaFormInput
            control={control}
            name="palabras_clave"
            id="palabras_clave"
            label="Palabras clave"
            rows={2}
            placeholder="palabras, clave, separadas"
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={6}>
          <TextAreaFormInput
            control={control}
            name="texto_busqueda"
            id="texto_busqueda"
            label="Texto de Búsqueda Indexado"
            rows={2}
            placeholder="Términos extra para búsqueda rápida..."
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={12}>
          <TextFormInput
            control={control}
            name="sinonimos"
            id="sinonimos"
            label="Sinónimos para Búsqueda"
            placeholder="sinónimos, alias"
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={12}>
          <Form.Group className="mb-3" controlId="producto-etiquetas">
            <Form.Label className="fw-semibold fs-13 text-body-emphasis">Etiquetas del Producto</Form.Label>
            <div className="d-flex gap-2 mb-2">
              <Form.Control
                type="text"
                size="sm"
                style={{ maxWidth: '320px' }}
                placeholder="Escribe una etiqueta y pulsa Intro o Agregar"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <Button variant="secondary" size="sm" onClick={handleAddTag}>
                <IconifyIcon icon="bx:plus" className="me-1" />
                Agregar etiqueta
              </Button>
            </div>
            <div className="d-flex flex-wrap gap-1 p-2 bg-body-tertiary rounded border min-h-38">
              {(formData?.etiquetas || []).length === 0 ? (
                <span className="text-muted fs-12">Sin etiquetas asignadas.</span>
              ) : (
                (formData?.etiquetas || []).map(tag => (
                  <Badge
                    key={tag}
                    bg="primary-subtle"
                    className="text-primary d-flex align-items-center gap-1 px-2 py-1 fs-12 fw-medium border border-primary border-opacity-25"
                  >
                    #{tag}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 border-0 text-primary d-inline-flex"
                      aria-label={`Eliminar etiqueta ${tag}`}
                      title={`Eliminar etiqueta ${tag}`}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <IconifyIcon icon="bx:x" className="fs-14" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default SeoInputsCard;
