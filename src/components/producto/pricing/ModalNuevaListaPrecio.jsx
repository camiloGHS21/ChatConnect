import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';

const ModalNuevaListaPrecio = ({
  show,
  onHide,
  onSave,
  existingLists = [],
}) => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    const name = nombre.trim();
    if (!name) return;
    if (existingLists.some(l => l.nombre?.trim().toLowerCase() === name.toLowerCase())) {
      setError(`Ya existe una lista de precios con el nombre "${name}".`);
      return;
    }
    try {
      setLoading(true);
      const created = await productoService.crearListaPrecio({ nombre: name });
      onSave({
        ...created,
        id: created.id,
        nombre: created.nombre || name,
        estado: created.estado || 'activo',
      });
      setNombre('');
      onHide();
    } catch (err) {
      console.error('Error al guardar lista de precios en DB:', err);
      setError(err.response?.data?.message || 'Error al guardar la lista de precios en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-16 fw-bold">
          <IconifyIcon icon="bx:purchase-tag-alt" className="me-2 text-primary" />
          Crear Nueva Lista de Precios
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted fs-13 mb-3">
          Crea una lista de precios para canales comerciales, distribuidores o contratistas.
        </p>
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Nombre de la Lista *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Constructor / Contratista VIP"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!nombre.trim() || loading}>
          {loading ? 'Guardando...' : 'Guardar Lista'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNuevaListaPrecio;
