import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Modal universal para renombrar catálogos maestros (Categorías, Marcas, Listas de Precios).
 */
const ModalEditarNombre = ({
  show,
  item,
  title = 'Editar Nombre',
  label = 'Nombre',
  onHide,
  onSave,
  loading = false,
}) => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setNombre(item.nombre || '');
      setError('');
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = nombre.trim();
    if (!val) {
      setError('El nombre no puede estar vacío');
      return;
    }
    onSave(item.id, val);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton closeLabel="Cerrar" className="border-bottom py-2">
        <Modal.Title className="fs-15 fw-semibold text-dark d-flex align-items-center">
          <IconifyIcon icon="bx:edit-alt" className="me-2 text-primary fs-18" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3">
          {error && <div className="alert alert-danger py-1 fs-12 mb-2">{error}</div>}
          <Form.Group>
            <Form.Label className="fs-12 fw-semibold text-secondary mb-1">{label} *</Form.Label>
            <Form.Control
              type="text"
              value={nombre}
              onChange={e => {
                setNombre(e.target.value);
                if (error) setError('');
              }}
              placeholder={`Ingresa el nuevo ${label.toLowerCase()}...`}
              autoFocus
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="light" size="sm" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading || !nombre.trim()}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEditarNombre;
