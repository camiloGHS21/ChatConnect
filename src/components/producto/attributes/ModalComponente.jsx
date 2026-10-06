import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';
import { getProductErrorMessage } from '../productErrorMessage';

const ModalComponente = ({
  show,
  onHide,
  attribute,
  initialData = null, // if editing
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (initialData) {
      setNombre(initialData.nombre || '');
      setValor(initialData.valor || '');
    } else {
      setNombre('');
      setValor('');
    }
    setError('');
  }, [initialData, show]);

  const handleSave = async () => {
    setError('');
    const name = nombre.trim();
    if (!name) {
      setError('Por favor ingresa el nombre de la opción.');
      return;
    }

    const isDuplicate = (attribute?.componentes || []).some(
      c => c.nombre.trim().toLowerCase() === name.toLowerCase() &&
           (!initialData || String(c.id_atributo_componente) !== String(initialData.id_atributo_componente))
    );
    if (isDuplicate) {
      setError(`Ya existe una opción con el nombre "${name}" en este atributo.`);
      return;
    }

    try {
      setLoading(true);
      let result;
      if (!initialData) {
        const created = await productoService.crearComponente({
          atributo_id: attribute.id_atributo,
          nombre: name,
          valor: valor.trim() || name,
        });
        result = {
          ...created,
          id_atributo_componente: created.id,
          nombre: created.nombre || name,
          codigo: created.codigo,
          valor: created.valor || valor.trim() || name,
          orden: created.orden || 99,
        };
      } else {
        result = {
          id_atributo_componente: initialData.id_atributo_componente,
          nombre: name,
          codigo: initialData.codigo,
          valor: valor.trim() || name,
          orden: initialData.orden || 99,
        };
      }

      onSave(attribute.id_atributo, result, !!initialData);
      onHide();
    } catch (err) {
      console.error('Error al guardar componente en DB:', err);
      setError(getProductErrorMessage(err, 'No se pudo guardar la opción.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered style={{ '--bs-modal-bg': 'var(--bs-body-bg)', '--bs-modal-color': 'var(--bs-body-color)', '--bs-modal-border-color': 'var(--bs-border-color)', '--bs-modal-header-border-color': 'var(--bs-border-color)', '--bs-modal-footer-border-color': 'var(--bs-border-color)' }}>
      <Modal.Header closeButton closeLabel="Cerrar">
        <Modal.Title className="fs-16 fw-bold">
          <IconifyIcon icon="bx:layer-plus" className="me-2 text-primary" />
          {initialData ? 'Editar Opción' : 'Nueva Opción'} ({attribute?.nombre})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Form.Group className="mb-3" controlId="componente-nombre">
          <Form.Label className="fw-semibold fs-12">Nombre de la Opción *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Rojo, 110V, Acero Inoxidable, XL"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="componente-valor">
          <Form.Label className="fw-semibold fs-12">Valor Interno / Técnico</Form.Label>
          <Form.Control
            type="text"
            placeholder="Opcional. Por defecto es igual al nombre."
            value={valor}
            onChange={e => setValor(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!nombre.trim() || loading}>
          {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Opción')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComponente;
